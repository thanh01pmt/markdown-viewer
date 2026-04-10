import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  fetchProjects, fetchProjectStatus, fetchAlignmentMatrix,
  fetchLessons, fetchLessonContent, fetchSlides, fetchChangelog, fetchAuditReports, clearCache,
  fetchAggrData
} from '../api/github';
import { parseProjectStatus, parseAlignmentMatrix } from '../utils/parsers';
import { getProjectFiles } from '../config';

export const useStore = create(
  persist(
    (set, get) => ({
      // Auth
      token: '',
      setToken: (token) => { clearCache(); set({ token }); },
      isTokenGateOpen: false,
      setTokenGateOpen: (open) => set({ isTokenGateOpen: open }),

      // Multi-Project
      projects: [],
      activeProject: 'pathway-aiot', // Default
      setActiveProject: (name) => {
        set({ 
          activeProject: name, status: null, matrix: [], lessons: [], slides: [], 
          activeLesson: null, activeLessonPack: null, groupMode: 'type' 
        });
        get().fetchAll();
      },
      setProjectByPath: (path) => get().setActiveProject(path),

      // Data
      status: null,
      matrix: [],
      lessons: [],
      slides: [],
      changelog: '',
      audits: [],
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
      groupMode: 'type', // 'type' (Doc Type) or 'pack' (Lesson Pack)
      setGroupMode: (mode) => set({ groupMode: mode, activeLessonPack: null }),
      activeLessonPack: null, // e.g. 'HP7_01'
      setActiveLessonPack: (pack) => set({ activeLessonPack: pack }),
      renderMode: 'doc', // 'slide' or 'doc'
      setRenderMode: (mode) => set({ renderMode: mode }),

      fetchAll: async () => {
        const { token, activeProject } = get();
        set({ loading: true, error: null });
        
        try {
          let statusMd = '', matrixMd = '', lessonFiles = [], slideFiles = [], changelogMd = '', projs = [], reports = [];

          if (!token) {
            // Use optimized aggregated fetch via Netlify Function
            const [aggr, projectList] = await Promise.all([
              fetchAggrData(activeProject),
              fetchProjects().catch(() => []),
            ]);

            const decode = (obj) => {
              if (!obj || !obj.content) return '';
              const binaryString = atob(obj.content.replace(/\n/g, ''));
              const bytes = new Uint8Array(binaryString.length);
              for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
              return new TextDecoder().decode(bytes);
            };

            statusMd = decode(aggr.status);
            matrixMd = decode(aggr.matrix);
            changelogMd = decode(aggr.changelog);
            lessonFiles = aggr.lessons.filter(f => f.name.endsWith('.md')).sort((a, b) => a.name.localeCompare(b.name));
            slideFiles = aggr.slides.filter(f => f.name.endsWith('.md')).sort((a, b) => a.name.localeCompare(b.name));
            projs = projectList;
          } else {
            // Legacy/Override: Fallback to individual calls (parallelized)
            const files = getProjectFiles(activeProject);
            const [s, m, l, sl, c, p, r] = await Promise.all([
              fetchProjectStatus(files.projectStatus, token),
              fetchAlignmentMatrix(files.alignmentMatrix, token).catch(() => ''),
              fetchLessons(files.lessonsDir, token).catch(() => []),
              fetchSlides(files.slidesDir, token).catch(() => []),
              fetchChangelog(files.changelog, token).catch(() => ''),
              fetchProjects(token).catch(() => []),
              fetchAuditReports(files.reportsDir, token).catch(() => []),
            ]);
            statusMd = s; matrixMd = m; lessonFiles = l; slideFiles = sl; changelogMd = c; projs = p; reports = r;
          }
          
          set({
            status: parseProjectStatus(statusMd),
            matrix: parseAlignmentMatrix(matrixMd),
            lessons: lessonFiles,
            slides: slideFiles,
            changelog: changelogMd,
            projects: projs,
            audits: reports,
            loading: false,
            lastFetched: Date.now(),
          });
        } catch (err) {
          set({ loading: false, error: err.message });
        }
      },


      selectLesson: async (lesson, type = 'lesson') => {
        const { token } = get();
        set({ 
          activeLesson: lesson, 
          lessonType: type, 
          renderMode: type === 'slide' ? 'slide' : 'doc',
          lessonLoading: true, 
          lessonContent: '' 
        });
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
