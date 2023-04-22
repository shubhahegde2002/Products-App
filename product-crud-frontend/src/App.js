import logo from "./logo.svg";
import "./App.css";
import Products from "./pages/Products";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import AddProduct from "./pages/AddProduct";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/api/addProduct" element={<AddProduct />} />
        <Route path="/" element={<Products/>} />
        <Route path="/api/updateProduct/:id" element={<AddProduct />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
