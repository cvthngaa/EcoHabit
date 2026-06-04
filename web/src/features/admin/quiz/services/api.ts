import { apiClient } from '../../../../shared/services/api-client';
import type {
  QuizQuestion,
  QuizStats,
  PaginatedResponse,
  ListQuizQuestionsQuery,
  CreateQuizQuestionDto,
  UpdateQuizQuestionDto,
  GenerateAdminQuizDto,
  UpdateQuizQuestionStatusDto,
  BulkUpdateStatusDto,
  QuizAttempt,
  QuizAttemptDetail,
  ListQuizAttemptsQuery,
  QuizSnapshot,
  QuizSnapshotDetail,
  ListQuizSnapshotsQuery,
  QuizCoverageItem,
} from './types';

// ─── QUESTIONS ───

export const getAdminQuizQuestions = async (params: ListQuizQuestionsQuery): Promise<PaginatedResponse<QuizQuestion>> => {
  const { data } = await apiClient.get('/admin/quiz/questions', { params });
  return data;
};

export const getAdminQuizStats = async (): Promise<QuizStats> => {
  const { data } = await apiClient.get('/admin/quiz/stats');
  return data;
};

export const createAdminQuizQuestion = async (dto: CreateQuizQuestionDto): Promise<QuizQuestion> => {
  const { data } = await apiClient.post('/admin/quiz/questions', dto);
  return data;
};

export const updateAdminQuizQuestion = async (id: string, dto: UpdateQuizQuestionDto): Promise<QuizQuestion> => {
  const { data } = await apiClient.patch(`/admin/quiz/questions/${id}`, dto);
  return data;
};

export const deleteAdminQuizQuestion = async (id: string): Promise<void> => {
  await apiClient.delete(`/admin/quiz/questions/${id}`);
};

export const generateAdminQuizQuestions = async (dto: GenerateAdminQuizDto): Promise<QuizQuestion[]> => {
  const { data } = await apiClient.post('/admin/quiz/generate', dto);
  return data;
};

export const updateAdminQuizQuestionStatus = async (id: string, dto: UpdateQuizQuestionStatusDto): Promise<QuizQuestion> => {
  const { data } = await apiClient.patch(`/admin/quiz/questions/${id}/status`, dto);
  return data;
};

export const bulkUpdateAdminQuizStatus = async (dto: BulkUpdateStatusDto): Promise<{ updated: number }> => {
  const { data } = await apiClient.patch('/admin/quiz/questions/status/bulk', dto);
  return data;
};

export const importAdminQuizQuestions = async (file: File): Promise<{ totalRows: number; created: number; skipped: number; errors: any[] }> => {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await apiClient.post('/admin/quiz/questions/import', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

// ─── ATTEMPTS ───

export const getAdminQuizAttempts = async (params: ListQuizAttemptsQuery): Promise<PaginatedResponse<QuizAttempt>> => {
  const { data } = await apiClient.get('/admin/quiz/attempts', { params });
  return data;
};

export const getAdminQuizAttemptDetail = async (id: string): Promise<QuizAttemptDetail> => {
  const { data } = await apiClient.get(`/admin/quiz/attempts/${id}`);
  return data;
};

// ─── SNAPSHOTS ───

export const getAdminQuizSnapshots = async (params: ListQuizSnapshotsQuery): Promise<PaginatedResponse<QuizSnapshot>> => {
  const { data } = await apiClient.get('/admin/quiz/snapshots', { params });
  return data;
};

export const getAdminQuizSnapshotDetail = async (id: string): Promise<QuizSnapshotDetail> => {
  const { data } = await apiClient.get(`/admin/quiz/snapshots/${id}`);
  return data;
};

// ─── COVERAGE ───

export const getAdminQuizCoverage = async (): Promise<QuizCoverageItem[]> => {
  const { data } = await apiClient.get('/admin/quiz/coverage');
  return data;
};
