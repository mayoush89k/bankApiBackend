import { randomInt } from "crypto";
import STATUS_CODES from "../constants/statusCodes.js";
import { readUsersFromFile, writeUsersToFile } from "../models/usersModel.js";
// import uuid from 'uuid';

/* add user /users/ 
    ID, cash (default 0), credit (default 0). */
export const addUser = (req, res, next) => {
  try {
    const { name, username, email, password } = req.body;

    if (!name || !username || !email || !password) {
      res.status(STATUS_CODES.BAD_REQUEST);
      throw new Error("Fill all required fields");
    }
    const users = readUsersFromFile();
    if (users.find((u) => u.username == username)) {
      res.status(STATUS_CODES.CONFLICT);
      throw new Error("Username is already exist");
    }
    if (users.find((u) => u.email == email)) {
      res.status(STATUS_CODES.CONFLICT);
      throw new Error("Email is already exist");
    }
    const newUser = {
      id: randomInt(999999999).toString(),
      name,
      username,
      email,
      password,
      accountNumber: [randomInt(99999).toString()],
      cash: 0,
      credit: 0,
    };
    users.push(newUser);
    console.log('users: ', users);
    writeUsersToFile(users);
    res.status(STATUS_CODES.CREATED).send(newUser);
  } catch (error) {
    next(error);
  }
};

/* Depositing /users/:id 
by the user's ID and amount of cash */
export const depositToUser = (req, res, next) => {
  try {
    const { amount } = req.body;
    if (amount <= 0) {
      res.status(STATUS_CODES.BAD_REQUEST);
      throw new Error("The value must be greater than zero");
    }
    const users = readUsersFromFile();
    const userIndex = users.findIndex((u) => u.id == req.params.id);
    if (userIndex == -1) {
      res.status(STATUS_CODES.NOT_FOUND);
      throw new Error("The user is not found");
    }
    users[userIndex] = {
      ...users[userIndex],
      cash: users[userIndex].cash + Number(amount),
    };
    writeUsersToFile(users);
    res.send(users[userIndex]);
  } catch (error) {
    next(error)
  }
};

/* update credit /users/:id 
only positive
until cash or credit run out*/
export const updateCreditToUser = (req, res, next) => {
    try {
        const { amount } = req.body;
        if (amount <= 0) {
          res.status(STATUS_CODES.BAD_REQUEST);
          throw new Error("The value must be greater than zero");
        }
        const users = readUsersFromFile();
        const userIndex = users.findIndex((u) => u.id == req.params.id);
        if (userIndex == -1) {
          res.status(STATUS_CODES.NOT_FOUND);
          throw new Error("The user is not found");
        }
        users[userIndex] = {
          ...users[userIndex],
          credit: users[userIndex].credit + Number(amount),
        };
        writeUsersToFile(users);
        res.send(users[userIndex]);
      } catch (error) {
        next(error)
      }
};

/*  transferring /users:id
    from user to user
    until cash and credit run out */
export const transferUserToUser = (req, res, next) => {
  try {
    // checking fields
    const { userId, amount } = req.body;
    if (!userId || !amount) {
      res.status(STATUS_CODES.BAD_REQUEST);
      throw new Error("Missing required fields");
    }
    // checking if users are exist
    const users = readUsersFromFile();
    const senderUserIndex = users.findIndex((u) => u.id == req.params.id);
    const receiverUserIndex = users.findIndex((u) => u.id == userId);
    if (senderUserIndex == -1 || receiverUserIndex == -1) {
      res.status(STATUS_CODES.NOT_FOUND);
      throw new Error("one of users not found");
    }

    //check availability of sender balance
    if (users[senderUserIndex].credit < amount) {
      res.status(STATUS_CODES.FORBIDDEN);
      throw new Error(`You don't have enough credit`);
    }

    // update amounts that
    // -   sender will decrease amount from his balance amount
    // -   receiver will increase amount to his balance amount
    users[senderUserIndex] = {
      ...users[senderUserIndex],
      credit: Number(users[senderUserIndex].credit) - Number(amount),
    };
    users[receiverUserIndex] = {
      ...users[receiverUserIndex],
      credit: Number(users[receiverUserIndex].credit) + Number(amount),
    };

    writeUsersToFile(users);
    res.status(STATUS_CODES.OK).send(users[senderUserIndex]);
  } catch (error) {
    next(error);
  }
};

// if send a wrong query
export const errorQuery = (req, res, next) => {
  try {
    throw new Error("Failed to Query");
  } catch (error) {
    next(error);
  }
};

/* show details of the user /users:id
 */
export const getUserDetails = (req, res, next) => {
  try {
    const users = readUsersFromFile();

    const user = users.find((u) => u.id == req.params.id);
    if (!user) {
      res.status(STATUS_CODES.NOT_FOUND);
      throw new Error("User has not found");
    }
    res.send(user);
  } catch (error) {
    next(error);
  }
};

/* show all users /users:id
 */
export const getUsers = (req, res, next) => {
  try {
    const users = readUsersFromFile();
    res.send(users);
  } catch (error) {
    next(error);
  }
};

/* filter by amount */
export const filterByAmount = (req, res, next) => {
  try {
    const users = readUsersFromFile();
    const filterUsers = users.sort((a, b) => (a.balance > b.balance ? 1 : -1));
    res.send(filterUsers);
  } catch (error) {
    next(error);
  }
};

/* filter by username */
export const filterByUsername = (req, res, next) => {
  try {
    const users = readUsersFromFile();
    const filterUsers = users.sort((a, b) =>
      a.username > b.username ? 1 : -1
    );
    res.send(filterUsers);
  } catch (error) {
    next(error);
  }
};
