const express = require("express");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find((user) => user.username === username);

  if (!user) return response.status(404).json({ error: "User not found!" });

  request.user = user;

  return next();
}

function checksExistsTODO(request, response, next) {
  const { user } = request;

  const { id } = request.params;

  const todo = user.todos.find((todo) => todo.id == id);

  if (!todo) return response.status(404).json({ error: "TODO not found!" });

  return next();
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;

  const userExists = users.some((user) => user.username === username);

  if (userExists)
    return response.status(400).json({ error: "User already exists!" });

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: [],
  };

  users.push(user);

  return response.status(201).json(user);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.status(200).json(user.todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request;

  const userTODO = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  user.todos.push(userTODO);

  return response.status(201).json(userTODO);
});

app.put(
  "/todos/:id",
  checksExistsUserAccount,
  checksExistsTODO,
  (request, response) => {
    const { title, deadline } = request.body;
    const { user } = request;
    const { id } = request.params;

    const TODO = user.todos.find((todo) => todo.id === id);

    if (title) TODO.title = title;

    if (deadline) TODO.deadline = deadline;

    return response.status(200).json(TODO);
  }
);

app.patch(
  "/todos/:id/done",
  checksExistsUserAccount,
  checksExistsTODO,
  (request, response) => {
    const { user } = request;
    const { id } = request.params;

    user.todos.map((todo) => {
      if (todo.id == id) {
        todo.done = true;
      }
    });

    const altered = user.todos.find((todo) => todo.id === id);

    return response.status(200).json(altered);
  }
);

app.delete(
  "/todos/:id",
  checksExistsUserAccount,
  checksExistsTODO,
  (request, response) => {
    const { user } = request;
    const { id } = request.params;

    const todo = user.todos.find((todo) => todo.id == id);

    user.todos = user.todos.filter((item) => item.id !== todo.id);

    return response.status(204).send();
  }
);

module.exports = app;
