import { BrowserRouter } from 'react-router-dom';
import AppRouter from './router/AppRouter';
import AnonymousFeedback from './components/AnonymousFeedback';
import './index.css';

function App() {
  return (
    <BrowserRouter>
      <AppRouter />
      <AnonymousFeedback />
    </BrowserRouter>
  );
}

export default App;
