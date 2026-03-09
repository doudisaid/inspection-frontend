import api from "@/api/axios";

export default {
  namespaced: true,

  state: () => ({
    willayas: [],
    currentUser: null,
    currentWilaya: null,
    // بقية الحالات (dairas, communes...) تبقى كما هي
  }),

  getters: {
    chefName: (state) => state.currentUser?.username || "",
    wilayaName: (state) => state.currentWilaya?.name || "",
  },

  mutations: {
    setWillayas(state, payload) {
      state.willayas = payload;
    },
    setCurrentUser(state, user) {
      state.currentUser = user;
    },
    setCurrentWilaya(state, wilaya) {
      state.currentWilaya = wilaya;
    },
    clearUser(state) {
      state.currentUser = null;
      state.currentWilaya = null;
    },
  },

  actions: {
    async fetchWillayas({ commit }) {
      try {
        const res = await api.get("/willayas");
        const mappedWillayas = res.data.map((w) => ({ id: w.id, name: w.willayaname }));
        commit("setWillayas", mappedWillayas);
        return mappedWillayas;
      } catch (err) {
        console.error("Failed to fetch willayas:", err);
      }
    },

    // أكشن حيوي: يربط id ولاية المستخدم باسمها من القائمة
    async updateCurrentWilaya({ commit, state, dispatch }) {
      if (!state.currentUser || !state.currentUser.willaya_id) return;

      // التأكد من أن قائمة الولايات محملة في الـ Store
      if (state.willayas.length === 0) {
        await dispatch("fetchWillayas");
      }

      const foundWilaya = state.willayas.find(w => String(w.id) === String(state.currentUser.willaya_id));
      
      if (foundWilaya) {
        commit("setCurrentWilaya", foundWilaya);
      } else {
        commit("setCurrentWilaya", { id: state.currentUser.willaya_id, name: "غير محدد" });
      }
    },

    async initUserFromLocalStorage({ commit, dispatch }) {
      try {
        const userStr = localStorage.getItem("user");
        const token = localStorage.getItem("authToken");

        if (userStr && userStr !== "undefined" && token) {
          const user = JSON.parse(userStr);
          commit("setCurrentUser", user);
          api.defaults.headers.common.Authorization = `Bearer ${token}`;
          
          // تحديث بيانات الولاية بناءً على المستخدم المسترجع
          await dispatch("updateCurrentWilaya");
        } else {
          dispatch("logout");
        }
      } catch (err) {
        dispatch("logout");
      }
    },

    logout({ commit }) {
      commit("clearUser");
      localStorage.removeItem("user");
      localStorage.removeItem("authToken");
      delete api.defaults.headers.common.Authorization;
    },
  },
};