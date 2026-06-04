import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAdminQuizQuestions,
  getAdminQuizStats,
  createAdminQuizQuestion,
  updateAdminQuizQuestion,
  deleteAdminQuizQuestion,
  generateAdminQuizQuestions,
  updateAdminQuizQuestionStatus,
  bulkUpdateAdminQuizStatus,
  importAdminQuizQuestions,
  getAdminQuizAttempts,
  getAdminQuizAttemptDetail,
  getAdminQuizSnapshots,
  getAdminQuizSnapshotDetail,
  getAdminQuizCoverage,
} from './api';
import type {
  ListQuizQuestionsQuery,
  CreateQuizQuestionDto,
  UpdateQuizQuestionDto,
  GenerateAdminQuizDto,
  UpdateQuizQuestionStatusDto,
  BulkUpdateStatusDto,
  ListQuizAttemptsQuery,
  ListQuizSnapshotsQuery,
} from './types';

// ─── QUESTIONS ───

export const useAdminQuizQuestions = (params: ListQuizQuestionsQuery) => {
  return useQuery({
    queryKey: ['admin-quiz-questions', params],
    queryFn: () => getAdminQuizQuestions(params),
  });
};

export const useAdminQuizStats = () => {
  return useQuery({
    queryKey: ['admin-quiz-stats'],
    queryFn: getAdminQuizStats,
    staleTime: 0,
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
  });
};

export const useCreateQuizQuestion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateQuizQuestionDto) => createAdminQuizQuestion(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-quiz-questions'] });
      queryClient.invalidateQueries({ queryKey: ['admin-quiz-stats'] });
      queryClient.invalidateQueries({ queryKey: ['admin-quiz-coverage'] });
    },
  });
};

export const useUpdateQuizQuestion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateQuizQuestionDto }) => updateAdminQuizQuestion(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-quiz-questions'] });
      queryClient.invalidateQueries({ queryKey: ['admin-quiz-stats'] });
    },
  });
};

export const useDeleteQuizQuestion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteAdminQuizQuestion(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-quiz-questions'] });
      queryClient.invalidateQueries({ queryKey: ['admin-quiz-stats'] });
      queryClient.invalidateQueries({ queryKey: ['admin-quiz-coverage'] });
    },
  });
};

export const useGenerateQuizQuestions = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: GenerateAdminQuizDto) => generateAdminQuizQuestions(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-quiz-questions'] });
      queryClient.invalidateQueries({ queryKey: ['admin-quiz-stats'] });
      queryClient.invalidateQueries({ queryKey: ['admin-quiz-coverage'] });
    },
  });
};

export const useUpdateQuizQuestionStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateQuizQuestionStatusDto }) => updateAdminQuizQuestionStatus(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-quiz-questions'] });
      queryClient.invalidateQueries({ queryKey: ['admin-quiz-stats'] });
      queryClient.invalidateQueries({ queryKey: ['admin-quiz-coverage'] });
    },
  });
};

export const useBulkUpdateQuizStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: BulkUpdateStatusDto) => bulkUpdateAdminQuizStatus(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-quiz-questions'] });
      queryClient.invalidateQueries({ queryKey: ['admin-quiz-stats'] });
      queryClient.invalidateQueries({ queryKey: ['admin-quiz-coverage'] });
    },
  });
};

export const useImportQuizQuestions = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => importAdminQuizQuestions(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-quiz-questions'] });
      queryClient.invalidateQueries({ queryKey: ['admin-quiz-stats'] });
      queryClient.invalidateQueries({ queryKey: ['admin-quiz-coverage'] });
    },
  });
};

// ─── ATTEMPTS ───

export const useAdminQuizAttempts = (params: ListQuizAttemptsQuery) => {
  return useQuery({
    queryKey: ['admin-quiz-attempts', params],
    queryFn: () => getAdminQuizAttempts(params),
    staleTime: 0,
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
  });
};

export const useAdminQuizAttemptDetail = (id: string | null) => {
  return useQuery({
    queryKey: ['admin-quiz-attempt-detail', id],
    queryFn: () => getAdminQuizAttemptDetail(id!),
    enabled: !!id,
  });
};

// ─── SNAPSHOTS ───

export const useAdminQuizSnapshots = (params: ListQuizSnapshotsQuery) => {
  return useQuery({
    queryKey: ['admin-quiz-snapshots', params],
    queryFn: () => getAdminQuizSnapshots(params),
    staleTime: 0,
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
  });
};

export const useAdminQuizSnapshotDetail = (id: string | null) => {
  return useQuery({
    queryKey: ['admin-quiz-snapshot-detail', id],
    queryFn: () => getAdminQuizSnapshotDetail(id!),
    enabled: !!id,
  });
};

// ─── COVERAGE ───

export const useAdminQuizCoverage = () => {
  return useQuery({
    queryKey: ['admin-quiz-coverage'],
    queryFn: getAdminQuizCoverage,
  });
};
