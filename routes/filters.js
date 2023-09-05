import express from 'express'
export var router = express.Router();
import {getDataByFilters, getTibuaLocationsData} from '../routes/utills/filtersController.js'



router.get('/tibuaLocations', async (req, res) => {
  try {
    const result = await getTibuaLocationsData();
    const transformedArray = result.map((tibuaLoc) => {
      return {
        id: tibuaLoc._id,
        points: [{
          lat: tibuaLoc.Lat,
          lng: tibuaLoc.Long,
          LocationNameEnglish: tibuaLoc.LocationNameEnglish,
          LocationNameHebrew: tibuaLoc.LocationNameHebrew,
          Details: tibuaLoc.Details,
        }]
      }
    });

    res.status(200).json(transformedArray); // return the result as a JSON response to the client
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message }); // return an error response if there's an error
  }
});

router.get('/', async (req, res) => {
  const { gender, observation, startDate, endDate, ringNum, ringWidth, dateKind, ringingArea, observationArea} = req.query;
  try {
    const result = await getDataByFilters(gender, observation, startDate, endDate, ringNum, ringWidth, dateKind, ringingArea, observationArea);
    const transformedArray = result.map((birdRing) => {
      return {
        id: birdRing._id,
        points: [{
          lat: birdRing.Lat,
          lng: birdRing.Long,
          date: birdRing.TibuaDate
        }]
      }
    });
    // console.log('transformedArray :>> ', transformedArray);

    // res.send(data);
    res.status(200).json(transformedArray); // return the result as a JSON response to the client
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message }); // return an error response if there's an error
  }
});

// module.exports = router;
