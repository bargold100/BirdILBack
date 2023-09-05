
import express from 'express'
export var router = express.Router();
import {getDetailsByEngName,getAllBirds, insertBird, removeBird, updateBird} from '../routes/utills/birdsController.js'

function cleanEnglishName(name)
{
  name = name.toLowerCase();
  //"/\s+/g"  match one or more whitespace characters and replace them with a single space character.
  name = name.replace(/[-,_+.:]/g, ' ').replace(/\s+/g, ' ');
  return name;
}

// params: english name, hebrew name, latin name, link to pic
router.post('/addBird', async function (req,res,next) {
  try
  {
    res.header("Access-Control-Allow-Origin", "*");
    let englishName = req.body.englishName;
    let latinName = req.body.latinName;
    let hebrewName = req.body.hebrewName;
    let bridImg = req.body.img;
    if (englishName && latinName && hebrewName && bridImg)
    {
      let cleanEngName = cleanEnglishName(englishName);
      let insertResult = await insertBird(englishName, cleanEngName, latinName,hebrewName , bridImg);
      if (insertResult)
      {
        res.status(200).send("success");
      }
      else
      {
        res.status(409).send("failed");
      }
    };


  }
  catch(error)
  {
    next(error);
  }
}
);
router.post('/removeBird', async function (req,res,next) {
  try
  {
    res.header("Access-Control-Allow-Origin", "*");
    let latinName = req.body.latinName;
    if (latinName)
    {
     
      let removeResult = await removeBird(latinName);
      if (removeResult)
      {
        res.status(200).send("success");
      }
      else
      {
        res.status(400).send("failed");
      }
    };


  }
  catch(error)
  {
    next(error);
  }
}
);
router.post('/updateBird', async function (req,res,next) {
  try
  {
    res.header("Access-Control-Allow-Origin", "*");
    let oldParams = req.body.originalParams;
    let newParams = req.body.newParams;
    if (oldParams && newParams)
    {
      if (newParams.english_name)
      {
        let cleanEngName = cleanEnglishName(newParams.english_name);
        newParams["cleanEngName"] = cleanEngName;

      }
      let updateResult = await updateBird(oldParams, newParams);
      if (updateResult)
      {
        res.status(200).send("success");
      }
      else
      {
        res.status(409).send("failed-duplicate");
      }
    };


  }
  catch(error)
  {
    next(error);
  }
}
);
router.get('/eng/:bird_name/', async function(req, res, next) {
    try {
      res.header("Access-Control-Allow-Origin", "*");

      let name1 = req.params.bird_name;
      name1 = name1.replace('+', ' ')
      name1 = name1.toLowerCase()
      // console.log(queryParams);
      // var result = await getPathByName(name1, queryParams);
      var result = await getDetailsByEngName(name1);
      res.send(result)
    } catch(error) {
      next(error);
    }
  });

  router.get('/', async function(req, res, next) {
    try {
      res.header("Access-Control-Allow-Origin", "*");
      var result = await getAllBirds();
      
      //res.render("test",{output: 1234})
      console.log("result from GET ringings:")
      res.send(result)
      //console.log(len(res.data))
      //console.log(res.data)
      //console.log()
    } catch (error) {
      next(error);
    }
  });
