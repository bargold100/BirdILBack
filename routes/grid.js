import express from 'express'
export var router = express.Router();
import {getGrid,getRingigngsPerGridCells} from '../routes/utills/gridController.js'



router.route("/ringings/").get(async function (req, res, next) {
    try {
        const features = await getRingigngsPerGridCells(req.params);
    res.send(features);
    } catch (error) {
        next(error);
    }
});



router.route("/").get(async function (req, res, next) {
    try {
        const features = await getGrid();
    res.send(features);
    } catch (error) {
        next(error);
    }
});

