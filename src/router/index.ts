import { createRouter, createWebHistory, createMemoryHistory } from "vue-router";
import MainView from "../views/MainView.vue";
import LoginView from "../views/LoginView.vue";
import { useLoginStore } from "../stores/login.store";
import MaterialsView from "../views/MaterialsView.vue";
import { validateAccessTokenApi } from "../api/auth.api";
import { prepareUserStore } from "../api/users.api";

const router = createRouter({
    history: createMemoryHistory(),
    routes: [
        {
            path: "/login",
            name: "login",
            component: LoginView,
            meta: { private: false },
        },
        {
            path: "/",
            name: "default",
            redirect: { name: "main" },
            meta: { private: true },
            children: [
                {
                    path: "/main",
                    name: "main",
                    component: MainView,
                    meta: { private: true },
                    children: [
                        {
                            path: '/materials/:chapter?',
                            name: 'materials',
                            meta: { private: true },
                            component: MaterialsView,
                        }
                    ]
                },
            ],
        },
    ],
});


// Защита ранжирования маршрутов
router.beforeEach(async (to, from, next) => {
    const store = useLoginStore();
    const isValide = await validateAccessTokenApi({ token: localStorage.getItem('token') });
    store.isAuth = isValide;
    if (!isValide) {
        // Приватный маршрут
        if (to.meta.private === true) {
            if (from.name !== 'login') {
                return next({ name: 'login' });
            }
        }
        // Обычный отстойный маршрут
        else {
            next();
        }
    }
    else {
        if (to.name === 'login') {
            return next({ name: 'main' });
        }
        // При первоначальном входе в приложение когда у нас выписан токен и мы на main странице
        // То в этот момент пользовательское хранилище не активно, потому его нужно активировать
        if(!from.name && to.name) {
            await prepareUserStore()
        }
        localStorage.setItem('current_route', JSON.stringify({ 
            name: to.name, 
            params: to.params, 
            query: to.query 
        }));
        next();
    }
});

export { router };
