import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  // バックエンドのローカルサーバーのURLとポート
  schema: 'http://localhost:3001/graphql',
  documents: ['src/**/*.tsx', 'src/**/*.ts'],
  ignoreNoDocuments: true,
  generates: {
    './src/gql/': {
      preset: 'client',
      config: {
        useTypeImports: true,
      },
    },
  },
};

export default config;