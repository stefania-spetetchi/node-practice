import axios from 'axios';

// const listBreweries = async () => {
//   const breweries = await getBreweries();
//   let items = breweries.data;
//   let key = "city";

//   if (items) {
//     let array = [];
//     items.forEach((item) => {
//       if (array.some((val) => {
//         return val[key] == item[key]
//       })) {
//         array.forEach((k) => {
//           if (k[key] === item[key]) {
//             k['occurrence']++
//           }
//         })
//       } else {
//         let cityObject = {}
//         cityObject[key] = item[key]
//         cityObject['occurrence'] = 1
//         array.push(cityObject);
//       }
//     })
//     console.log(array);
//   }
// }

// listBreweries();

// const manageOutput = (response) => {
//   if (response) {
//     let items = response.data;
//     let key = "city";
//     if (items) {
//       let arrayOfCities = [];
//       items.forEach((item) => {
//         if (arrayOfCities.some((val) => {
//           return val[key] == item[key]
//         })) {
//           arrayOfCities.forEach((city) => {
//             if (city[key] === item[key]) {
//               city['occurrence']++
//             }
//           })
//         } else {
//           let cityObject = {}
//           cityObject[key] = item[key]
//           cityObject['occurrence'] = 1
//           arrayOfCities.push(cityObject);
//         }
//       })
//       console.log(`this ran second`, arrayOfCities);
//       return arrayOfCities
//     } else {
//       console.log('this array is empty')
//     }
//   }
// }

const getBreweries = async () => {
  try {
    const response = await axios.get(
      'https://api.openbrewerydb.org/breweries?by_state=texas&by_type=micro&per_page=50'
    );
    console.log(`this ran first`, response);
    return response;
  } catch (err) {
    console.error(err);
  }
};

// const manageOutput = (response) => {
//   if (response) {
//     let items = response.data;
//     let key = "city";
//     if (items) {
//       let arrayOfCities = [];
//       items.forEach((item) => {
//         if (arrayOfCities.some((val) => {
//           return val[key] == item[key]
//         })) {
//           arrayOfCities.forEach((city) => {
//             if (city[key] === item[key]) {
//               city['occurrence']++
//             }
//           })
//         } else {
//           let cityObject = {}
//           cityObject[key] = item[key]
//           cityObject['occurrence'] = 1
//           arrayOfCities.push(cityObject);
//         }
//       })
//       console.log(`this ran second`, arrayOfCities);
//       return arrayOfCities
//     } else {
//       console.log('this array is empty')
//     }
//   }
// }

// 1. iterate through the data and extract the zip code and city name,
// and create a new array  - DONE
// 2. iterate through the new array of cities and zips, create a new array, where
// the key is the first two digits of the zip and value is an array of cities located
// in that zip code group
// 2alt. iterate through the new array of cities and zips, create a new array, where
// the key is the first two digits of the zip and value is the number of cities
// locate in that zip code group

const modifyData = (response) => {
  const items = response.data;
  if (items) {
    const key = 'postal_code';
    const key2 = 'city';
    const key3 = 'cities';
    const arrayOfCities = [];
    const arrayOfCitiesAndZips = [];
    const zipArrayByCity = [];

    items.forEach((item) => {
      const citiesAndZipsObject = {};
      citiesAndZipsObject[key] = item[key].slice(0, 2);
      citiesAndZipsObject[key2] = item[key2];
      arrayOfCitiesAndZips.push(citiesAndZipsObject);
    });

    console.log(arrayOfCitiesAndZips);

    arrayOfCitiesAndZips.forEach((zip) => {
      const zipCodesObject = {};
      const citiesArray = [];
      const postalCode = zip[key];
      zipCodesObject[key] = postalCode;

      if (zipArrayByCity.some((element) => element[key] === postalCode)) {
        // if the zip code exists in the array, update the cities array
        zipArrayByCity.forEach((eachCity) => {
          if (eachCity[key] === postalCode) {
            if (eachCity.cities.some((name) => name === zip.city)) {
              console.log('already exists');
            } else {
              eachCity.cities.push(zip.city);
            }
          }
        });
      } else {
        // if it doesn't, add the zip code and create the array and add the city yo it
        zipCodesObject[key3] = citiesArray;
        zipCodesObject.cities.push(zip.city);
        zipArrayByCity.push(zipCodesObject);
      }
    });

    console.log(zipArrayByCity);
    return zipArrayByCity;
  }
};

const postBreweries = async (zipArrayByCity) => {
  try {
    const res = await axios
      .post('http://localhost:3000/posts', zipArrayByCity)
      .then((response) => {
        console.log(response.status, response);
      });
  } catch (err) {
    console.error(err);
  }
};

const mainLogic = async () => {
  const response = await getBreweries();
  let result = null;
  if (response) {
    result = modifyData(response);
    // result = manageOutput(response);
    const postResponse = await postBreweries(result);
  }
};

mainLogic();
