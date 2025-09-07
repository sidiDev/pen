import FileLayout from "./FileLayout.tsx";
import { BrowserRouter, Routes, Route } from "react-router";
import Home from "./Home.tsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route index path="/" element={<Home />} />
        <Route path="file/:id" element={<FileLayout />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
