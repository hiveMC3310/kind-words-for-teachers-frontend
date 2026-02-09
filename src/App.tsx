import { Toaster as Sonner } from '@/components/ui/sonner'
import { Toaster } from '@/components/ui/toaster'
import { TooltipProvider } from '@/components/ui/tooltip'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import AdminDashboard from './pages/AdminDashboard'
import Index from './pages/Index'
import NotFound from './pages/NotFound'
import PraiseForm from './pages/PraiseForm'
import TeacherDashboard from './pages/TeacherDashboard'
import TeacherList from './pages/TeacherList'
import TeacherLogin from './pages/TeacherLogin'

const queryClient = new QueryClient()

const App = () => (
	<QueryClientProvider client={queryClient}>
		<TooltipProvider>
			<Toaster />
			<Sonner />
			<BrowserRouter>
				<Routes>
					<Route path='/' element={<Index />} />
					<Route path='/teachers' element={<TeacherList />} />
					<Route path='/praise/:teacherId' element={<PraiseForm />} />
					<Route path='/teacher/login' element={<TeacherLogin />} />
					<Route path='/teacher/dashboard' element={<TeacherDashboard />} />
					<Route path='/admin/dashboard' element={<AdminDashboard />} />
					<Route path='*' element={<NotFound />} />
				</Routes>
			</BrowserRouter>
		</TooltipProvider>
	</QueryClientProvider>
)

export default App
