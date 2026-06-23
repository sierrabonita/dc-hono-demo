import { buildSchema } from 'graphql';

export const typeDefs = buildSchema(`
  type User {
    id: Int!
    name: String!
    email: String!
    role: Int!
    createdAt: String!
    updatedAt: String!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  input CreateUserInput {
    name: String!
    email: String!
    password: String!
    role: Int!
  }

  input UpdateUserInput {
    id: Int!
    name: String
    email: String
    password: String
    role: Int
  }

  input LoginInput {
    email: String!
    password: String!
  }


  type Query {
    users: [User!]!
    user(id: Int!): User
  }

  type Mutation {
    createUser(input: CreateUserInput!): User!
    updateUser(input: UpdateUserInput!): User!
    deleteUser(id: Int!): User!
    login(input: LoginInput!): AuthPayload!
    logout: Boolean!
  }
`);
