import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './Home';
import Menu from './Menu';
import Bilbao from "./Spreadsheet";
import Madrid from './Madrid';




import Barcelona from './Barcelona';
import Malaga from "./Malaga";
import Sevilla from './Sevilla';
import MenuSuperior from './MenuSuperior';
import BusesMadrid from './BusesMadrid'
import LineaA1 from './LineaA1'
import LineaA2 from './LineaA2'
import LineaA3 from './LineaA3'
import LineaA4 from './LineaA4'
import LineaA5 from './LineaA5'
import LineaA6 from './LineaA6'
import LineaA42 from './LineaA42'
import LineaM607 from './LineaM607'
import Buses from './Buses';
import BusesAndalucia from './BusesAndalucia';
import BusesAndaluciaOccidental from './BusesAndaluciaOccidental';
import BusesAndaluciaOriental from './BusesAndaluciaOriental';
import BusesExtremadura from './BusesExtremadura';
import BusesLevante from './BusesLevante';
import BusesMurcia from './BusesMurcia';
import BusesCastillaLaMancha from './BusesCastillaLaMancha';
import Levante from './Levante';
import BusesToledo from './BusesToledo';
import BusesGuadalajara from './BusesGuadalajara';
import BusesNorte from './BusesNorte';
import BusesCantabria from './BusesCantabria';
import BusesGalicia from './BusesGalicia';
import BusesCastillaLeon from './BusesCastillaLeon';
import BusesSalamanca from './BusesSalamanca';
import BusesValladolid from './BusesValladolid';
import BusesMallorca from './BusesMallorca';
import Mobiliario from './Mobiliario';
import MobiliarioAndalucia from './MobiliarioAndalucia';
import MobiliarioNorte from './MobiliarioNorte';
import MobiliarioMadrid from './MobiliarioMadrid';
import MobiliarioAlcalaDeGuadaira from './MobiliarioAlcalaDeGuadaira';
import MobiliarioTorrelavega from './MobiliarioTorrelavega';
import MupisHM from './MupisHM';












const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/inicio" element={<MenuSuperior />} />
        <Route path="/madrid" element={<Madrid />} />
        <Route path="/barcelona" element={<Barcelona />} />
        <Route path="/malaga" element={<Malaga />} />
        <Route path="/sevilla" element={<Sevilla />} />
        <Route path="/bilbao" element={<Bilbao />} />
        <Route path="/buses/busesMadrid" element={<BusesMadrid />} />

      
        <Route path="/buses/extremadura" element={<BusesExtremadura />} />
      
        <Route path="/buses/A1" element={<LineaA1 />} />
        <Route path="/buses/A2" element={<LineaA2 />} />
        <Route path="/buses/A3" element={<LineaA3 />} />
        <Route path="/buses/A4" element={<LineaA4 />} />
        <Route path="/buses/A5" element={<LineaA5 />} />
        <Route path="/buses/A6" element={<LineaA6 />} />
        <Route path="/buses/A42" element={<LineaA42 />} />
        <Route path="/buses/M607" element={<LineaM607 />} />
        <Route path="/buses" element={<Buses />} />
        <Route path="/buses/andalucia" element={<BusesAndalucia />} />
        <Route path="/buses/andalucia/oriental" element={<BusesAndaluciaOriental />} />
<Route path="/buses/andalucia/occidental" element={<BusesAndaluciaOccidental />} />

        <Route path="/buses/levante" element={<Levante />} />
        <Route path="/buses/levante/Levante" element={<BusesLevante />} />
        <Route path="/buses/levante/Murcia" element={<BusesMurcia />} />
        <Route path="/buses/CastillaLaMancha" element={<BusesCastillaLaMancha />} />
        <Route path="/buses/Toledo" element={<BusesToledo />} />
        <Route path="/buses/Guadalajara" element={<BusesGuadalajara />} />
        <Route path="/buses/Norte" element={<BusesNorte />} />
        <Route path="/buses/Cantabria" element={<BusesCantabria />} />
        <Route path="/buses/Galicia" element={<BusesGalicia />} />
        <Route path="/buses/CastillaLeon" element={<BusesCastillaLeon />} />
        <Route path="/buses/Salamanca" element={<BusesSalamanca />} />
        <Route path="/buses/Valladolid" element={<BusesValladolid />} />
        <Route path="/buses/Mallorca" element={<BusesMallorca />} />
        <Route path="/mobiliario" element={<Mobiliario />} />
        <Route path="/mobiliario/andalucia" element={<MobiliarioAndalucia />} />
        <Route path="/mobiliario/norte" element={<MobiliarioNorte />} />

        
        <Route path="/mobiliario/Madrid" element={<MobiliarioMadrid/>} />
        <Route path="/mobiliario/alcala" element={<MobiliarioAlcalaDeGuadaira />} />
        <Route path="/mobiliario/Torrelavega" element={<MobiliarioTorrelavega />} />
        <Route path="/mobiliario/mupisHM" element={<MupisHM />} />

        



        







        

        


        


      </Routes>
    </Router>
  );
};

export default App;
