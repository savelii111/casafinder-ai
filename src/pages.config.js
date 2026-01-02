import Activity from './pages/Activity';
import Admin from './pages/Admin';
import Favorites from './pages/Favorites';
import Home from './pages/Home';
import Portfolio from './pages/Portfolio';
import Settings from './pages/Settings';
import Subscription from './pages/Subscription';
import Neighborhoods from './pages/Neighborhoods';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Activity": Activity,
    "Admin": Admin,
    "Favorites": Favorites,
    "Home": Home,
    "Portfolio": Portfolio,
    "Settings": Settings,
    "Subscription": Subscription,
    "Neighborhoods": Neighborhoods,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};