import { buildSchema } from 'graphql';

export const typeDefs = buildSchema(`
  type User {
    id: Int!
    name: String!
    email: String!
    role: Int!
    createdAt: String!
    updatedAt: String!
    reviews: [Review!]!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type Movie {
    id: Int!
    title: String!
    originalTitle: String!
    releaseDate: String!
    createdAt: String!
    updatedAt: String!
  }

  type Review {
    id: Int!
    userId: Int!
    movieId: Int!
    content: String!
    isSpoiler: Int!
    createdAt: String!
    updatedAt: String!
    user: User!
    movie: Movie!
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
    me: User
    reviews: [Review!]!
  }

  type Mutation {
    createUser(input: CreateUserInput!): User!
    updateUser(input: UpdateUserInput!): User!
    deleteUser(id: Int!): User!
    login(input: LoginInput!): AuthPayload!
    logout: Boolean!
  }
`);
