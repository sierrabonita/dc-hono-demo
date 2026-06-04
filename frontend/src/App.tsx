import { useQuery } from 'urql';
import { graphql } from './gql/index';

// 実行するGraphQLクエリの定義
const GET_USERS = graphql(`
  query GetUsers {
    users {
      id
      name
      email
      role
      createdAt
      updatedAt
    }
  }
`);

function App() {
  const [result] = useQuery({ query: GET_USERS });
  const { data, fetching, error } = result;

  if (fetching) return <p>ロード中...</p>;
  if (error) return <p>エラーが発生しました: {error.message}</p>;

  return (
    <div style={{ padding: '2rem' }}>
      <h1>ユーザー一覧</h1>
      <ul>
        {data?.users.map((user) => (
          <li key={user.id}>
            {user.name} ({user.email}) - 登録日: {user.createdAt} - 更新日: {user.updatedAt} - 権限: {user.role === 1 ? '管理者' : '一般ユーザー'}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;