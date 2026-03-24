import MessageCell from '@/components/MessageCell'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { apiClient, Teacher } from '@/lib/api'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
    BarChart3,
    Eye,
    EyeOff,
    GraduationCap,
    Heart,
    LogOut,
    MessageSquare,
    Plus,
    Search,
    Trash2,
    Users
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

const AdminDashboard = () => {
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const [teacher, setTeacher] = useState<Teacher | null>(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
    const [newTeacher, setNewTeacher] = useState({
        username: '',
        full_name: '',
        subject: '',
        password: '',
        role: 'teacher' as 'teacher' | 'admin',
    })
    const [expandedMessages, setExpandedMessages] = useState<Set<string>>(new Set())
    const [deleteDialog, setDeleteDialog] = useState<{
        isOpen: boolean
        type: 'teacher' | 'praise' | null
        id: string | null
        name: string | null
    }>({
        isOpen: false,
        type: null,
        id: null,
        name: null,
    })

    // Проверяем авторизацию при загрузке
    useEffect(() => {
        const storedTeacher = sessionStorage.getItem('teacher')
        if (!storedTeacher) {
            navigate('/teacher/login')
            return
        }
        const parsedTeacher = JSON.parse(storedTeacher)
        if (parsedTeacher.role !== 'admin') {
            toast.error('Доступ запрещен')
            navigate('/teacher/dashboard')
            return
        }
        setTeacher(parsedTeacher)
    }, [navigate])

    // Загружаем статистику
    const {data: stats, isLoading: isLoadingStats} = useQuery({
        queryKey: ['admin-stats'],
        queryFn: () => apiClient.getAdminStats(),
        enabled: !!teacher,
    })

    // Загружаем всех учителей
    const {
        data: teachers,
        isLoading: isLoadingTeachers,
        refetch: refetchTeachers,
    } = useQuery({
        queryKey: ['all-teachers'],
        queryFn: () => apiClient.getAllTeachers(),
        enabled: !!teacher,
    })

    // Загружаем все сообщения
    const {
        data: praises,
        isLoading: isLoadingPraises,
        refetch: refetchPraises,
    } = useQuery({
        queryKey: ['all-praises'],
        queryFn: () => apiClient.getAllPraises(),
        enabled: !!teacher,
    })

    // Мутации
    const createTeacherMutation = useMutation({
        mutationFn: () => apiClient.createTeacher(newTeacher),
        onSuccess: () => {
            toast.success('Учитель создан')
            setIsAddDialogOpen(false)
            setNewTeacher({
                username: '',
                full_name: '',
                subject: '',
                password: '',
                role: 'teacher',
            })
            refetchTeachers()
        },
        onError: (error: Error) => {
            toast.error('Ошибка создания', {
                description: error.message,
            })
        },
    })

    const deleteTeacherMutation = useMutation({
        mutationFn: (teacherId: string) => apiClient.deleteTeacher(teacherId),
        onSuccess: () => {
            toast.success('Учитель удален')
            refetchTeachers()
            setDeleteDialog({
                isOpen: false,
                type: null,
                id: null,
                name: null,
            })
        },
        onError: (error: Error) => {
            toast.error('Ошибка удаления', {
                description: error.message,
            })
        },
    })

    const deletePraiseMutation = useMutation({
        mutationFn: (praiseId: string) => apiClient.deletePraise(praiseId),
        onSuccess: () => {
            toast.success('Сообщение удалено')
            refetchPraises()
            setDeleteDialog({
                isOpen: false,
                type: null,
                id: null,
                name: null,
            })
        },
        onError: (error: Error) => {
            toast.error('Ошибка удаления', {
                description: error.message,
            })
        },
    })

    // Создаем карту учителей для быстрого поиска
    const teacherMap = useMemo(() => {
        const map = new Map<string, Teacher>()
        teachers?.forEach(t => map.set(t.id, t))
        return map
    }, [teachers])

    const handleLogout = () => {
        sessionStorage.removeItem('teacher')
        sessionStorage.removeItem('teacher_token')
        toast.success('Вы вышли из системы')
        navigate('/')
    }

    const handleCreateTeacher = () => {
        if (
            !newTeacher.username ||
            !newTeacher.full_name ||
            !newTeacher.subject ||
            !newTeacher.password
        ) {
            toast.error('Заполните все поля')
            return
        }
        createTeacherMutation.mutate()
    }

    const toggleMessageExpanded = (praiseId: string) => {
        setExpandedMessages(prev => {
            const newSet = new Set(prev)
            if (newSet.has(praiseId)) {
                newSet.delete(praiseId)
            } else {
                newSet.add(praiseId)
            }
            return newSet
        })
    }

    const openDeleteDialog = (type: 'teacher' | 'praise', id: string, name: string) => {
        setDeleteDialog({
            isOpen: true,
            type,
            id,
            name,
        })
    }

    const handleDelete = () => {
        if (!deleteDialog.id) return

        if (deleteDialog.type === 'teacher') {
            deleteTeacherMutation.mutate(deleteDialog.id)
        } else if (deleteDialog.type === 'praise') {
            deletePraiseMutation.mutate(deleteDialog.id)
        }
    }

    const filteredTeachers = teachers?.filter(
        teacher =>
            teacher.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            teacher.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
            teacher.username.toLowerCase().includes(searchTerm.toLowerCase()),
    )

    // Фильтрация сообщений с поиском по содержимому и имени учителя
    const filteredPraises = praises?.filter(praise => {
        const teacher = teacherMap.get(praise.teacher_id)
        const teacherName = teacher?.full_name || ''
        const teacherSubject = teacher?.subject || ''

        return (
            praise.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
            teacherName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            teacherSubject.toLowerCase().includes(searchTerm.toLowerCase())
        )
    })

    if (!teacher) {
        return (
            <div className='min-h-screen flex items-center justify-center'>
                <Skeleton className='h-8 w-32'/>
            </div>
        )
    }

    return (
        <div className='min-h-screen bg-gradient-to-b from-background via-muted/30 to-background'>
            <div className='container mx-auto px-4 py-12'>
                {/* Header */}
                <div className='flex items-center justify-between mb-8'>
                    <div className='flex items-center space-x-4'>
                        <div
                            className='w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center'>
                            <GraduationCap className='w-8 h-8 text-primary-foreground'/>
                        </div>
                        <div>
                            <h1 className='text-3xl font-bold'>{teacher.full_name}</h1>
                            <div className='flex items-center space-x-2'>
                                <span className='text-muted-foreground'>Администратор</span>
                                <span className='px-2 py-1 text-xs bg-primary/20 text-primary rounded-full'>
                  Админ
                </span>
                            </div>
                        </div>
                    </div>
                    <Button variant='outline' onClick={handleLogout}>
                        <LogOut className='w-4 h-4 mr-2'/>
                        Выйти
                    </Button>
                </div>

                {/* Stats Cards */}
                <div className='grid md:grid-cols-3 gap-6 mb-8'>
                    <Card className='p-6'>
                        <div className='flex items-center space-x-3'>
                            <div className='w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center'>
                                <Users className='w-6 h-6 text-blue-600'/>
                            </div>
                            <div>
                                {isLoadingStats ? (
                                    <Skeleton className='h-8 w-16 mb-1'/>
                                ) : (
                                    <p className='text-2xl font-bold'>
                                        {stats?.total_teachers || 0}
                                    </p>
                                )}
                                <p className='text-sm text-muted-foreground'>Всего учителей</p>
                            </div>
                        </div>
                    </Card>

                    <Card className='p-6'>
                        <div className='flex items-center space-x-3'>
                            <div className='w-12 h-12 rounded-full bg-green-100 flex items-center justify-center'>
                                <Heart className='w-6 h-6 text-green-600'/>
                            </div>
                            <div>
                                {isLoadingStats ? (
                                    <Skeleton className='h-8 w-16 mb-1'/>
                                ) : (
                                    <p className='text-2xl font-bold'>
                                        {stats?.total_praises || 0}
                                    </p>
                                )}
                                <p className='text-sm text-muted-foreground'>Всего сообщений</p>
                            </div>
                        </div>
                    </Card>

                    <Card className='p-6'>
                        <div className='flex items-center space-x-3'>
                            <div className='w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center'>
                                <BarChart3 className='w-6 h-6 text-purple-600'/>
                            </div>
                            <div>
                                {isLoadingStats ? (
                                    <Skeleton className='h-8 w-16 mb-1'/>
                                ) : (
                                    <p className='text-2xl font-bold'>
                                        {stats?.praises_last_week || 0}
                                    </p>
                                )}
                                <p className='text-sm text-muted-foreground'>За неделю</p>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Search and Add Button */}
                <div className='flex items-center justify-between mb-6'>
                    <div className='relative flex-1 max-w-md'>
                        <Search
                            className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4'/>
                        <Input
                            placeholder='Поиск по учителям, предметам или сообщениям...'
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className='pl-10'
                        />
                    </div>
                    <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className='w-4 h-4 mr-2'/>
                                Добавить учителя
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Добавить нового учителя</DialogTitle>
                                <DialogDescription>
                                    Введите данные нового преподавателя
                                </DialogDescription>
                            </DialogHeader>
                            <div className='space-y-4 py-4'>
                                <div className='space-y-2'>
                                    <Label htmlFor='username'>Имя пользователя</Label>
                                    <Input
                                        id='username'
                                        placeholder='username'
                                        value={newTeacher.username}
                                        onChange={e =>
                                            setNewTeacher({...newTeacher, username: e.target.value})
                                        }
                                    />
                                </div>
                                <div className='space-y-2'>
                                    <Label htmlFor='full_name'>Полное имя</Label>
                                    <Input
                                        id='full_name'
                                        placeholder='Иванов Иван Иванович'
                                        value={newTeacher.full_name}
                                        onChange={e =>
                                            setNewTeacher({
                                                ...newTeacher,
                                                full_name: e.target.value,
                                            })
                                        }
                                    />
                                </div>
                                <div className='space-y-2'>
                                    <Label htmlFor='subject'>Предмет</Label>
                                    <Input
                                        id='subject'
                                        placeholder='Учитель математики'
                                        value={newTeacher.subject}
                                        onChange={e =>
                                            setNewTeacher({...newTeacher, subject: e.target.value})
                                        }
                                    />
                                </div>
                                <div className='space-y-2'>
                                    <Label htmlFor='password'>Пароль</Label>
                                    <Input
                                        id='password'
                                        type='password'
                                        placeholder='Сложный пароль'
                                        value={newTeacher.password}
                                        onChange={e =>
                                            setNewTeacher({...newTeacher, password: e.target.value})
                                        }
                                    />
                                </div>
                                <div className='space-y-2'>
                                    <Label htmlFor='role'>Роль</Label>
                                    <select
                                        id='role'
                                        className='w-full px-3 py-2 border border-gray-300 rounded-md'
                                        value={newTeacher.role}
                                        onChange={e =>
                                            setNewTeacher({
                                                ...newTeacher,
                                                role: e.target.value as 'teacher' | 'admin',
                                            })
                                        }
                                    >
                                        <option value='teacher'>Учитель</option>
                                        <option value='admin'>Администратор</option>
                                    </select>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button
                                    variant='outline'
                                    onClick={() => setIsAddDialogOpen(false)}
                                >
                                    Отмена
                                </Button>
                                <Button
                                    onClick={handleCreateTeacher}
                                    disabled={createTeacherMutation.isPending}
                                >
                                    {createTeacherMutation.isPending ? 'Создание...' : 'Создать'}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Tabs */}
                <Tabs defaultValue='teachers' className='space-y-6'>
                    <TabsList>
                        <TabsTrigger value='teachers'>
                            <Users className='w-4 h-4 mr-2'/>
                            Учителя ({teachers?.length || 0})
                        </TabsTrigger>
                        <TabsTrigger value='praises'>
                            <MessageSquare className='w-4 h-4 mr-2'/>
                            Сообщения ({praises?.length || 0})
                        </TabsTrigger>
                    </TabsList>

                    {/* Teachers Tab */}
                    <TabsContent value='teachers'>
                        <Card>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Имя пользователя</TableHead>
                                        <TableHead>Полное имя</TableHead>
                                        <TableHead>Предмет</TableHead>
                                        <TableHead>Роль</TableHead>
                                        <TableHead className='text-right'>Действия</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isLoadingTeachers ? (
                                        Array.from({length: 5}).map((_, i) => (
                                            <TableRow key={i}>
                                                <TableCell>
                                                    <Skeleton className='h-4 w-24'/>
                                                </TableCell>
                                                <TableCell>
                                                    <Skeleton className='h-4 w-32'/>
                                                </TableCell>
                                                <TableCell>
                                                    <Skeleton className='h-4 w-20'/>
                                                </TableCell>
                                                <TableCell>
                                                    <Skeleton className='h-4 w-16'/>
                                                </TableCell>
                                                <TableCell>
                                                    <Skeleton className='h-8 w-8 ml-auto'/>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : filteredTeachers?.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className='text-center py-8'>
                                                <Users
                                                    className='w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50'/>
                                                <h3 className='text-lg font-semibold mb-2'>
                                                    Учителя не найдены
                                                </h3>
                                                <p className='text-muted-foreground'>
                                                    {searchTerm
                                                        ? 'Попробуйте изменить поисковый запрос'
                                                        : 'Добавьте первого учителя'}
                                                </p>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredTeachers?.map(teacher => (
                                            <TableRow key={teacher.id}>
                                                <TableCell className='font-medium'>
                                                    {teacher.username}
                                                </TableCell>
                                                <TableCell>{teacher.full_name}</TableCell>
                                                <TableCell>{teacher.subject}</TableCell>
                                                <TableCell>
                          <span
                              className={`px-2 py-1 text-xs rounded-full ${
                                  teacher.role === 'admin'
                                      ? 'bg-primary/20 text-primary'
                                      : 'bg-gray-100 text-gray-700'
                              }`}
                          >
                            {teacher.role === 'admin' ? 'Админ' : 'Учитель'}
                          </span>
                                                </TableCell>
                                                <TableCell className='text-right'>
                                                    <Button
                                                        variant='ghost'
                                                        size='sm'
                                                        onClick={() =>
                                                            openDeleteDialog('teacher', teacher.id, teacher.full_name)
                                                        }
                                                        disabled={deleteTeacherMutation.isPending}
                                                    >
                                                        <Trash2 className='w-4 h-4 text-red-500'/>
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </Card>
                    </TabsContent>

                    {/* Praises Tab */}
                    <TabsContent value='praises'>
                        <Card>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Дата</TableHead>
                                        <TableHead>Учитель</TableHead>
                                        <TableHead>Предмет</TableHead>
                                        <TableHead>Автор</TableHead>
                                        <TableHead>Сообщение</TableHead>
                                        <TableHead className='text-right'>Действия</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isLoadingPraises ? (
                                        Array.from({length: 5}).map((_, i) => (
                                            <TableRow key={i}>
                                                <TableCell>
                                                    <Skeleton className='h-4 w-24'/>
                                                </TableCell>
                                                <TableCell>
                                                    <Skeleton className='h-4 w-32'/>
                                                </TableCell>
                                                <TableCell>
                                                    <Skeleton className='h-4 w-24'/>
                                                </TableCell>
                                                <TableCell>
                                                    <Skeleton className='h-4 w-20'/>
                                                </TableCell>
                                                <TableCell>
                                                    <Skeleton className='h-4 w-full'/>
                                                </TableCell>
                                                <TableCell>
                                                    <Skeleton className='h-8 w-8 ml-auto'/>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : filteredPraises?.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className='text-center py-8'>
                                                <MessageSquare
                                                    className='w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50'/>
                                                <h3 className='text-lg font-semibold mb-2'>
                                                    Сообщения не найдены
                                                </h3>
                                                <p className='text-muted-foreground'>
                                                    {searchTerm
                                                        ? 'Попробуйте изменить поисковый запрос'
                                                        : 'Нет сообщений для отображения'}
                                                </p>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredPraises?.map(praise => {
                                            const teacher = teacherMap.get(praise.teacher_id)
                                            return (
                                                <TableRow key={praise.id}>
                                                    <TableCell>
                                                        {new Date(praise.created_at).toLocaleDateString(
                                                            'ru-RU',
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        {teacher?.full_name || 'Неизвестно'}
                                                    </TableCell>
                                                    <TableCell>
                                                        {teacher?.subject || 'Неизвестно'}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className='flex items-center space-x-2'>
                                                            {praise.is_anonymous ? (
                                                                <EyeOff className='w-4 h-4 text-muted-foreground'/>
                                                            ) : (
                                                                <Eye className='w-4 h-4 text-muted-foreground'/>
                                                            )}
                                                            <span>
                                {praise.is_anonymous
                                    ? 'Анонимно'
                                    : praise.user_name || 'Неизвестно'}
                              </span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className='max-w-xs'>
                                                        <MessageCell
                                                            message={praise.message}
                                                            isExpanded={expandedMessages.has(praise.id)}
                                                            onToggle={() => toggleMessageExpanded(praise.id)}
                                                        />
                                                    </TableCell>
                                                    <TableCell className='text-right'>
                                                        <Button
                                                            variant='ghost'
                                                            size='sm'
                                                            onClick={() =>
                                                                openDeleteDialog('praise', praise.id, 'Сообщение')
                                                            }
                                                            disabled={deletePraiseMutation.isPending}
                                                        >
                                                            <Trash2 className='w-4 h-4 text-red-500'/>
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        })
                                    )}
                                </TableBody>
                            </Table>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>

            {/* Единый диалог подтверждения удаления */}
            <Dialog
                open={deleteDialog.isOpen}
                onOpenChange={(open) => {
                    if (!open) {
                        setDeleteDialog({
                            isOpen: false,
                            type: null,
                            id: null,
                            name: null,
                        })
                    }
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            Удалить {deleteDialog.type === 'teacher' ? 'учителя' : 'сообщение'}?
                        </DialogTitle>
                        <DialogDescription>
                            {deleteDialog.type === 'teacher' ? (
                                <>Вы уверены, что хотите удалить учителя <strong>{deleteDialog.name}</strong>? Это
                                    действие нельзя отменить.</>
                            ) : (
                                <>Вы уверены, что хотите удалить это сообщение? Это действие нельзя отменить.</>
                            )}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant='outline'
                            onClick={() => {
                                setDeleteDialog({
                                    isOpen: false,
                                    type: null,
                                    id: null,
                                    name: null,
                                })
                            }}
                            disabled={deleteTeacherMutation.isPending || deletePraiseMutation.isPending}
                        >
                            Отмена
                        </Button>
                        <Button
                            variant='destructive'
                            onClick={handleDelete}
                            disabled={deleteTeacherMutation.isPending || deletePraiseMutation.isPending}
                        >
                            {(deleteTeacherMutation.isPending || deletePraiseMutation.isPending) ? 'Удаление...' : 'Удалить'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default AdminDashboard