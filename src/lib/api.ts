const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

export interface Teacher {
	id: string
	username: string
	full_name: string
	subject: string
	role: 'teacher' | 'admin'
}

export interface PraiseMessage {
	id: string
	teacher_id: string
	message: string
	created_at: string
	is_anonymous: boolean
	user_name: string | null
}

export interface LoginCredentials {
	username: string
	password: string
}

export interface LoginResponse {
	teacher: Teacher
	token?: string
}

export interface AdminStats {
	total_teachers: number
	total_praises: number
	praises_last_week: number
}

class ApiClient {
	private baseUrl: string

	constructor(baseUrl: string) {
		this.baseUrl = baseUrl
	}

	private async request<T>(
		endpoint: string,
		options: RequestInit = {},
	): Promise<T> {
		const url = `/api/${endpoint}`

		const token = sessionStorage.getItem('teacher_token')

		const config = {
			headers: {
				'Content-Type': 'application/json',
				...(token && { Authorization: `Bearer ${token}` }),
				...options.headers,
			},
			...options,
		}

		const response = await fetch(url, config)

		if (!response.ok) {
			// Пробуем получить JSON с ошибкой
			let errorMessage = `Ошибка ${response.status}: ${response.statusText}`

			try {
				const errorData = await response.json()
				// Используем поле detail из ответа сервера, если оно есть
				errorMessage =
					errorData.detail || errorData.message || JSON.stringify(errorData)
			} catch {
				// Если не удалось распарсить JSON, используем текст
				try {
					const text = await response.text()
					errorMessage = text || errorMessage
				} catch {
					// Оставляем дефолтное сообщение
				}
			}

			throw new Error(errorMessage)
		}

		return response.json()
	}

	// Teacher methods
	async getTeachers(): Promise<Teacher[]> {
		return this.request<Teacher[]>('/teachers')
	}

	async getTeacher(teacherId: string): Promise<Teacher> {
		return this.request<Teacher>(`/teachers/${teacherId}`)
	}

	// Auth methods
	async teacherLogin(credentials: LoginCredentials): Promise<LoginResponse> {
		return this.request<LoginResponse>('/auth/login', {
			method: 'POST',
			body: JSON.stringify(credentials),
		})
	}

	// Praise methods
	async sendPraise(
		teacherId: string,
		message: string,
		isAnonymous: boolean,
		userName?: string,
	): Promise<{ success: boolean }> {
		return this.request<{ success: boolean }>('/praise', {
			method: 'POST',
			body: JSON.stringify({
				teacher_id: teacherId,
				message: message,
				is_anonymous: isAnonymous,
				user_name: userName || null,
			}),
		})
	}

	async getTeacherPraise(teacherId: string): Promise<PraiseMessage[]> {
		return this.request<PraiseMessage[]>(`/praise/teacher/${teacherId}`)
	}

	// Admin methods
	async getAdminStats(): Promise<AdminStats> {
		return this.request<AdminStats>('/admin/stats')
	}

	async getAllTeachers(): Promise<Teacher[]> {
		return this.request<Teacher[]>('/teachers')
	}

	async getAllPraises(): Promise<PraiseMessage[]> {
		return this.request<PraiseMessage[]>('/admin/praises')
	}

	async deletePraise(praiseId: string): Promise<{ success: boolean }> {
		return this.request<{ success: boolean }>(`/admin/praises/${praiseId}`, {
			method: 'DELETE',
		})
	}

	async createTeacher(data: {
		username: string
		full_name: string
		subject: string
		password: string
		role: string
	}): Promise<Teacher> {
		return this.request<Teacher>('/admin/teachers', {
			method: 'POST',
			body: JSON.stringify(data),
		})
	}

	async updateTeacher(
		teacherId: string,
		data: {
			full_name?: string
			subject?: string
			password?: string
		},
	): Promise<Teacher> {
		return this.request<Teacher>(`/admin/teachers/${teacherId}`, {
			method: 'PUT',
			body: JSON.stringify(data),
		})
	}

	async deleteTeacher(teacherId: string): Promise<{ success: boolean }> {
		return this.request<{ success: boolean }>(`/admin/teachers/${teacherId}`, {
			method: 'DELETE',
		})
	}

	// Verify token (optional)
	async verifyToken(): Promise<Teacher> {
		return this.request<Teacher>('/auth/me')
	}
}

export const apiClient = new ApiClient(API_BASE_URL)
