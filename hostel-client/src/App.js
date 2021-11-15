
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

// Pages import
import Home from './pages/Home'
import Facilities from './pages/Facilities'
import RulesRegulations from './pages/Rules_Regulations'
import Maintenance from './pages/Maintenance'
import Contact from './pages/Contact'
import NotFound from './pages/NotFound'

// components import
import Header from './components/Header';
import Footer from './components/Footer';

function App() {

  

  return (
    
    <Router>
      <div className="App">
        <Header />
        <div className="content">
          <Switch>
            <Route exact path='/'>
              <Home/>
            </Route>
            <Route exact path='/facilities'>
              <Facilities/>
            </Route>
            <Route exact path='/rules-&-regulations'>
              <RulesRegulations/>
            </Route>
            <Route exact path='/maintenance'>
              <Maintenance/>
            </Route>
            <Route exact path='/contact'>
              <Contact/>
            </Route>
            <Route path='*'>
              <NotFound/>
            </Route>
          </Switch>
        </div>
        <Footer/>
      </div>
    </Router>
  );
}

export default App;