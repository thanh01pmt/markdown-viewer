import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  fetchProjectStatus, fetchAlignmentMatrix,
  fetchLessons, fetchLessonContent, fetchChangelog, clearCache,
} from '../api/github';
import { parseProjectStatus, parseAlignmentMatrix } from '../utils/parsers';

export const useStore = create(
  persist(
    (set, get) => ({
      // Auth
      token: '',
      setToken: (token) => { clearCache(); set({ token }); },

      // Data
      status: null,
      matrix: [],
      lessons: [],
      changelog: '',
      loading: false,
      error: null,
      lastFetched: null,

      // UI
      activeLesson: null,
      lessonContent: '',
      lessonLoading: false,
      theme: 'dark',

      fetchAll: async () => {
        const { token } = get();
        set({ loading: true, error: null });
        try {
          const [statusMd, matrixMd, lessonFiles, changelogMd] = await Promise.all([
            fetchProjectStatus(token),
            fetchAlignmentMatrix(token).catch(() => ''),
            fetchLessons(token).catch(() => []),
            fetchChangelog(token).catch(() => ''),
          ]);
          set({
            status: parseProjectStatus(statusMd),
            matrix: parseAlignmentMatrix(matrixMd),
            lessons: lessonFiles,
            changelog: changelogMd,
            loading: false,
            lastFetched: Date.now(),
          });
        } catch (err) {
          set({ loading: false, error: err.message });
        }
      },

      selectLesson: async (lesson) => {
        const { token } = get();
        set({ activeLesson: lesson, lessonLoading: true, lessonContent: '' });
        try {
          const content = await fetchLessonContent(lesson.path, token);
          set({ lessonContent: content, lessonLoading: false });
        } catch {
          set({ lessonContent: '> ⚠ Không thể tải nội dung bài học này.', lessonLoading: false });
        }
      },

      clearLesson: () => set({ activeLesson: null, lessonContent: '' }),
      refresh: () => { clearCache(); get().fetchAll(); },
      toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),
    }),
    {
      name: 'pathway-dashboard-v2',
      partialize: (state) => ({ token: state.token, theme: state.theme }),
    }
  )
);
