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

  type Query {
    users: [User!]!
    user(id: Int!): User
  }

  type Mutation {
    createUser(name: String!, email: String!, password: String!): User!
    updateUser(id: Int!, name: String, email: String, password: String): User
    deleteUser(id: Int!): User
    login(email: String!, password: String!): AuthPayload!
    logout: Boolean!
  }
`);
