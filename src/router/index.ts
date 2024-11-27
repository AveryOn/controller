import { createRouter, createWebHistory, createMemoryHistory } from "vue-router";
import MainView from "../views/MainView.vue";
import LoginView from "../views/LoginView.vue";
import { useLoginStore } from "../stores/login.store";
import MaterialsView from "../views/MaterialsView.vue";

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
                            component: MaterialsView,
                        }
                    ]
                },
            ],
        },
    ],
});


// Защита ранжирования маршрутов
router.beforeEach((to, from, next) => {
    const { isAuth } = useLoginStore();
    if (isAuth === false) {
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
        next();
    }
});

export { router };
