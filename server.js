import axios from 'axios';

const getData = async () => {
  try {
    const response = await axios.get(
      'https://candidate.hubteam.com/candidateTest/v3/problem/dataset?userKey=56e0465f710170dfcae8a90ccaed'
    );
    console.log(response.status, response);
    return response;
  } catch (err) {
    console.error(err);
  }
};

const modifyData = (response) => {
  const { events } = response.data;
  const visitorsObject = {};

  events.forEach((visitor) => {
    if (!(visitor.visitorId in visitorsObject)) {
      visitorsObject[visitor.visitorId] = {
        uniqueVisits: {},
      };
    }
  });

  events.forEach((event) => {
    if (!(event.timestamp in visitorsObject[event.visitorId].uniqueVisits)) {
      visitorsObject[event.visitorId].uniqueVisits[event.timestamp] = event.url;
    }
  });
  // created an object of unique visitors and their sessions

  // for each user, need to extract the timestamps, sort them, and identify the ones that are part of a chained session, all others will be individual sessions.

  const arrayOfEventsPerUser = {};

  events.forEach((item) => {
    if (!(item.visitorId in arrayOfEventsPerUser)) {
      arrayOfEventsPerUser[item.visitorId] = [];
    }
  });

  const timeStampUrlLinks = {};
  events.forEach((timestamp) => {
    if (!(timestamp.timestamp in timeStampUrlLinks)) {
      timeStampUrlLinks[timestamp.timestamp] = timestamp.url;
    }
  });

  events.forEach((time) => {
    arrayOfEventsPerUser[time.visitorId].push(time.timestamp);
    arrayOfEventsPerUser[time.visitorId].sort((a, b) => b - a);
    return arrayOfEventsPerUser;
    // created an object for users and a respective array of sessions for each
  });
  const uniqueVisitors = Object.keys(arrayOfEventsPerUser);
  // created an array of users to loop through each user and their sessions

  const sessionsByUser = {};
  uniqueVisitors.forEach((visitor) => {
    sessionsByUser[visitor] = [];
    return sessionsByUser;
  });

  const arrayOfUsers = [];
  for (let i = 0; i < uniqueVisitors.length; i += 1) {
    const sessionsObject = { [uniqueVisitors[i]]: [] };
    const uniqueSession = { pages: [] };
    const uniqueVisitorArray = arrayOfEventsPerUser[uniqueVisitors[i]];
    let maxDifference = 0;
    let start = 0;
    // find the chained sessions and push them into the uniqueSession
    for (let j = 0; j < uniqueVisitorArray.length; j += 1) {
      for (let n = j + 1; n < uniqueVisitorArray.length; n += 1) {
        const timeDifference = uniqueVisitorArray[j] - uniqueVisitorArray[n];
        if (timeDifference < 600000) {
          if (timeDifference > maxDifference) {
            uniqueSession.pages.push(uniqueVisitorArray[n]);
            uniqueSession.pages.push(uniqueVisitorArray[j]);
            maxDifference = timeDifference;
            start = uniqueVisitorArray[n];
          }
        }
      }
      uniqueSession.duration = maxDifference;
      uniqueSession.startTime = start;
    }
    const noDuplicates = uniqueSession.pages.reduce(
      (previousValue, currentValue) => {
        if (previousValue.indexOf(currentValue) === -1) {
          previousValue.push(currentValue);
        }
        return previousValue;
      },
      []
    );
    uniqueSession.pages = [];
    uniqueSession.pages.push(noDuplicates);
    sessionsObject[uniqueVisitors[i]].push(uniqueSession);
    sessionsByUser[uniqueVisitors[i]].push(uniqueSession);
    arrayOfUsers.push(sessionsObject);
  }
  uniqueVisitors.forEach((user) => {
    sessionsByUser[user][0].pages[0].forEach((page) => {
      sessionsByUser[user][0].pages[0].push(timeStampUrlLinks[page]);
    });
    const count = sessionsByUser[user][0].pages[0].length / 2;
    sessionsByUser[user][0].pages[0].splice(0, count);
  });
  console.log(sessionsByUser);
  return sessionsByUser;
};

const postData = async (sessionsByUser) => {
  try {
    const res = await axios
      .post(
        'https://candidate.hubteam.com/candidateTest/v3/problem/result?userKey=56e0465f710170dfcae8a90ccaed',
        sessionsByUser
      )
      .then((response) => {
        console.log(response.status, response);
      });
  } catch (err) {
    console.error(err);
  }
};

const mainFunction = async () => {
  const response = await getData();
  let result = null;
  if (response) {
    result = modifyData(response);
    const postResponse = await postData(result);
  }
};

mainFunction();
