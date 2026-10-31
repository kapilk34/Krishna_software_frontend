import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Login from "./Components/Login";
import SignUp from "./Components/SignUp";
import ProtectedRoute from "./router/ProtectedRoute";
import DashboardLayout from "./layouts/DashboardLayout";
import Home from "./DashBoardPages/Home";
import Transactions from "./DashBoardPages/Upload_doc";
import Settings from "./DashBoardPages/Settings";
import BooksJournals from "./DashBoardPages/BooksJournals";
import PdfOfficeFiles from "./DashBoardPages/PdfOfficeFiles";
import ImagesPhotographs from "./DashBoardPages/ImagesPhotographs";
import AudioVideo from "./DashBoardPages/AudioVideo";
import ArchivesManuscripts from "./DashBoardPages/ArchivesManuscripts";
import ScannedDocuments from "./DashBoardPages/ScannedDocuments";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<Home />} />
            <Route path="/dashboard/upload_doc" element={<Transactions />} />
            <Route path="/dashboard/settings" element={<Settings />} />
            <Route path="/dashboard/books-journals" element={<BooksJournals />} />
            <Route path="/dashboard/pdf-office-files" element={<PdfOfficeFiles />} />
            <Route path="/dashboard/images-photographs" element={<ImagesPhotographs />} />
            <Route path="/dashboard/audio-video" element={<AudioVideo />} />
            <Route path="/dashboard/archives-manuscripts" element={<ArchivesManuscripts />} />
            <Route path="/dashboard/scanned-documents" element={<ScannedDocuments />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;