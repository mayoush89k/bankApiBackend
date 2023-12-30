import { Router } from "express";
import {
  addUser,
  depositToUser,
  errorQuery,
  filterByAmount,
  filterByUsername,
  getUserDetails,
  getUsers,
  transferUserToUser,
  updateCreditToUser,
} from "../controller/bankController.js";

export const usersRoutes = Router();
export const adminRoutes = Router();

// admin controls
/* add user /users/ 
    ID, cash (default 0), credit (default 0). */
usersRoutes.post("/", addUser);

/* Depositing, update and transfer /users/:id?q as query
    - deposit: 
        by the user's ID and amount of cash 
    - update credit:
        only positive
        until cash or credit run out
    - transferring :
        from user to user
        until cash and credit run out */
usersRoutes.put("/:id", (req, res, next) => {
  req.query["q"] == "transfer"
    ? transferUserToUser(req, res, next)
    : req.query["q"] == "credit"
    ? updateCreditToUser(req, res, next)
    : req.query["q"] == "deposit"
    ? depositToUser(req, res, next)
    : errorQuery(req, res, next);
});

// filter by amount / by userName
usersRoutes.get("/:id", getUserDetails);

// show details of the user and filter /users?filter
// Show details of all users /users/
usersRoutes.get("/", (req, res, next) => {
  req.query["filter"] == "amount"
    ? filterByAmount(req, res, next)
    : req.query["filter"] == "username"
    ? filterByUsername(req, res, next)
    : getUsers(req, res, next);
});
