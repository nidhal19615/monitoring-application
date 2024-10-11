/*!

=========================================================
* Black Dashboard React v1.2.2
=========================================================

* Product Page: https://www.creative-tim.com/product/black-dashboard-react
* Copyright 2023 Creative Tim (https://www.creative-tim.com)
* Licensed under MIT (https://github.com/creativetimofficial/black-dashboard-react/blob/master/LICENSE.md)

* Coded by Creative Tim

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

*/
import Dashboard from "views/Dashboard.js";
import PrometheusChart from "views/PrometheusChart.js";
import CpuChart from "views/CpuChart.js";
import CalculatepriceRAM from "views/CalculatepriceRAM.js";
import  RamChart from "views/RamChart.js";

import CalculatepriceCPU from "views/CalculatepriceCPU.js";



var routes = [
  {
    path: "/dashboard",
    name: "Dashboard",
    rtlName: "لوحة القيادة",
    icon: "tim-icons icon-chart-pie-36",
    component: <PrometheusChart />,
    layout: "/admin",
  },
  {
    path: "/CpuChart",
    name: "CpuChart",
    rtlName: "إخطارات",
    icon: "tim-icons icon-bell-55",
    component: <CpuChart />,
    layout: "/admin",
  },
  
  {
    path: "/RamChart",
    name: "RamChart",
    rtlName: "ملف تعريفي للمستخدم",
    icon: "tim-icons icon-single-02",
    component: <RamChart />,
    layout: "/admin",
  },
  
  
  {
    path: "/CalculatepriceRAM",
    name: "CalculatepriceRAM ",
    rtlName: "طباعة",
    icon: "tim-icons icon-align-center",
    component: <CalculatepriceRAM/>,
    layout: "/admin",
  },
  
  {
    path: "/CalculatepriceCPU",
    name: "CalculatepriceCPU ",
    rtlName: "طباعة",
    icon: "tim-icons icon-align-center",
    component: <CalculatepriceCPU/>,
    layout: "/admin",
  },
  
];
export default routes;
