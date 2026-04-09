import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  fetchProjects, fetchProjectStatus, fetchAlignmentMatrix,
  fetchLessons, fetchLessonContent, fetchSlides, fetchChangelog, clearCache,
} from '../api/github';
import { parseProjectStatus, parseAlignmentMatrix } from '../utils/parsers';
import { getProjectFiles } from '../config';

export const useStore = create(
  persist(
    (set, get) => ({
      // Auth
      token: '',
      setToken: (token) => { clearCache(); set({ token }); },

      // Multi-Project
      projects: [],
      activeProject: 'pathway-aiot', // Default
      setActiveProject: (name) => {
        set({ activeProject: name, status: null, matrix: [], lessons: [], slides: [], activeLesson: null });
        get().fetchAll();
      },

      // Data
      status: null,
      matrix: [],
      lessons: [],
      slides: [],
      changelog: '',
      loading: false,
      error: null,
      lastFetched: null,

      // UI
      activeLesson: null,
      lessonContent: '',
      lessonLoading: false,
      lessonType: 'lesson', // 'lesson' or 'slide'
      searchQuery: '',
      setSearchQuery: (q) => set({ searchQuery: q }),
      filterHP: '', // e.g. 'HP7'
      setFilterHP: (hp) => set({ filterHP: hp }),

      fetchAll: async () => {
        const { token, activeProject } = get();
        set({ loading: true, error: null });
        const files = getProjectFiles(activeProject);
        
        try {
          const [statusMd, matrixMd, lessonFiles, slideFiles, changelogMd, projs] = await Promise.all([
            fetchProjectStatus(files.projectStatus, token),
            fetchAlignmentMatrix(files.alignmentMatrix, token).catch(() => ''),
            fetchLessons(files.lessonsDir, token).catch(() => []),
            fetchSlides(files.slidesDir, token).catch(() => []),
            fetchChangelog(files.changelog, token).catch(() => ''),
            fetchProjects(token).catch(() => []),
          ]);
          
          set({
            status: parseProjectStatus(statusMd),
            matrix: parseAlignmentMatrix(matrixMd),
            lessons: lessonFiles,
            slides: slideFiles,
            changelog: changelogMd,
            projects: projs,
            loading: false,
            lastFetched: Date.now(),
          });
        } catch (err) {
          set({ loading: false, error: err.message });
        }
      },

      selectLesson: async (lesson, type = 'lesson') => {
        const { token } = get();
        set({ activeLesson: lesson, lessonType: type, lessonLoading: true, lessonContent: '' });
        try {
          const content = await fetchLessonContent(lesson.path, token);
          set({ lessonContent: content, lessonLoading: false });
        } catch {
          set({ lessonContent: `> ⚠ Không thể tải nội dung ${type === 'lesson' ? 'bài học' : 'slide'} này.`, lessonLoading: false });
        }
      },

      clearLesson: () => set({ activeLesson: null, lessonContent: '' }),
      refresh: () => { clearCache(); get().fetchAll(); },
    }),
    {
      name: 'dashboard-v1',
      partialize: (state) => ({ token: state.token, activeProject: state.activeProject }), 
    }
  )
);
