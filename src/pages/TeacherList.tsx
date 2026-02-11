import {Button} from '@/components/ui/button'
import {Card} from '@/components/ui/card'
import {Input} from '@/components/ui/input' // Добавляем импорт Input
import {Skeleton} from '@/components/ui/skeleton'
import {apiClient} from '@/lib/api'
import {useQuery} from '@tanstack/react-query'
import {ArrowLeft, GraduationCap, Search} from 'lucide-react' // Добавляем иконку Search
import {useNavigate} from 'react-router-dom'
import {useState, useMemo} from 'react' // Добавляем хуки для состояния и мемоизации

const TeacherList = () => {
    const navigate = useNavigate()
    const [searchTerm, setSearchTerm] = useState('') // Состояние для строки поиска

    const {data: teachers, isLoading} = useQuery({
        queryKey: ['teachers'],
        queryFn: () => apiClient.getTeachers(),
    })

    // Фильтрация учителей по поисковому запросу
    const filteredTeachers = useMemo(() => {
        if (!teachers) return []

        return teachers.filter(teacher =>
            teacher.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            teacher.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
            teacher.username.toLowerCase().includes(searchTerm.toLowerCase())
        )
    }, [teachers, searchTerm])

    // Функция очистки поиска
    const clearSearch = () => setSearchTerm('')

    return (
        <div className='min-h-screen bg-gradient-to-b from-background via-muted/30 to-background'>
            <div className='container mx-auto px-4 py-12'>
                {/* Header */}
                <div className='mb-8'>
                    <Button
                        variant='ghost'
                        onClick={() => navigate('/')}
                        className='mb-4'
                    >
                        <ArrowLeft className='w-4 h-4 mr-2'/>
                        На главную
                    </Button>
                    <h1 className='text-4xl font-bold mb-2'>Выберите учителя</h1>
                    <p className='text-muted-foreground mb-6'>
                        Выберите учителя, чтобы написать ему
                    </p>

                    {/* Строка поиска */}
                    <div className='relative max-w-md'>
                        <Search
                            className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4'/>
                        <Input
                            type='text'
                            placeholder='Поиск по имени, предмету или логину...'
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className='pl-10 pr-10'
                        />
                        {searchTerm && (
                            <Button
                                variant='ghost'
                                size='sm'
                                className='absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0'
                                onClick={clearSearch}
                            >
                                ×
                            </Button>
                        )}
                    </div>

                    {/* Счетчик результатов */}
                    {!isLoading && (
                        <p className='text-sm text-muted-foreground mt-3'>
                            Найдено учителей: {filteredTeachers.length}
                            {searchTerm && filteredTeachers.length === 0 && (
                                <span className='ml-2 text-destructive'>
									По запросу "{searchTerm}" ничего не найдено
								</span>
                            )}
                        </p>
                    )}
                </div>

                {/* Teachers Grid */}
                <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-6'>
                    {isLoading
                        ? Array.from({length: 6}).map((_, i) => (
                            <Card key={i} className='p-6'>
                                <Skeleton className='h-12 w-12 rounded-full mb-4'/>
                                <Skeleton className='h-6 w-3/4 mb-2'/>
                                <Skeleton className='h-4 w-1/2'/>
                            </Card>
                        ))
                        : filteredTeachers.map(teacher => (
                            <Card
                                key={teacher.id}
                                className='p-6 hover:shadow-glow transition-all duration-300 border-2 hover:border-accent cursor-pointer group'
                                onClick={() => navigate(`/praise/${teacher.id}`)}
                            >
                                <div className='flex items-start space-x-4'>
                                    <div className='flex-shrink-0'>
                                        <div
                                            className='w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center group-hover:scale-110 transition-transform'>
                                            <GraduationCap className='w-6 h-6 text-primary-foreground'/>
                                        </div>
                                    </div>
                                    <div className='flex-1 min-w-0'>
                                        <h3 className='text-lg font-semibold mb-1 truncate'>
                                            {teacher.full_name}
                                        </h3>
                                        <p className='text-sm text-muted-foreground'>
                                            {teacher.subject}
                                        </p>
                                        {teacher.role === 'admin' && (
                                            <span
                                                className='inline-block mt-1 px-2 py-1 text-xs font-semibold rounded-full bg-primary/10 text-primary'>
													Администратор
												</span>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        ))}
                </div>
            </div>
        </div>
    )
}

export default TeacherList