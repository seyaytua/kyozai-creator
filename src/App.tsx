import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { MainLayout } from './components/Layout';
import { Home, ExamEditor, WorksheetEditor, LessonPlanEditor, Settings } from './pages';

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "exam",
        children: [
          { index: true, element: <ExamEditor /> },
          { path: "new", element: <ExamEditor /> },
        ],
      },
      {
        path: "worksheet",
        children: [
          { index: true, element: <WorksheetEditor /> },
          { path: "new", element: <WorksheetEditor /> },
        ],
      },
      {
        path: "lesson-plan",
        children: [
          { index: true, element: <LessonPlanEditor /> },
          { path: "new", element: <LessonPlanEditor /> },
        ],
      },
      {
        path: "settings",
        element: <Settings />,
      },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;


