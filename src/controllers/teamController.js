const { ApiError } = require("../exceptions/api.error");
const { jwtService } = require("../services/jwtService");
const { Team } = require('../models/team');

async function createTeam(req, res) {
  try {
    const { user_ids } = req.body
    const { refresh_token } = req.cookies;

    if (!refresh_token) throw ApiError.unauthorized("No refresh token provided");

    let userData = await jwtService.verifyRefresh(refresh_token);

    if (!userData) {
      res.clearCookie("refresh_token");
      throw ApiError.unauthorized("Invalid refresh token");
    }

    const team = await Team.create({
      company_id: userData.id,
      user_ids,
    })

    res.json(team);
  } catch (err) {
    console.log("Error createTeam ________________:", err);
    next(err);
  }
}


// async function addToTeam(req, res) {
//   try {
//     const { company_id, user_ids, task_ids } = req.body
//     const { refresh_token } = req.cookies;

//     if (!refresh_token) throw ApiError.unauthorized("No refresh token provided");

//     let userData = await jwtService.verifyRefresh(refresh_token);

//     if (!userData) {
//       res.clearCookie("refresh_token");
//       throw ApiError.unauthorized("Invalid refresh token");
//     }

//     // const team = Team.findAll({where:{}})

//     res.json(tasks);
//   } catch (err) {
//     console.log("Error addToTeam ________________:", err);
//     next(err);
//   }
// }




















const controller = {
  createTeam,
  // addToTeam,
};

module.exports = controller;
