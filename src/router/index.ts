import { createRouter, createMemoryHistory } from "vue-router";
import MainView from "../views/MainView.vue";
import LoginView from "../views/LoginView.vue";
import { useLoginStore } from "../stores/login.store";
import MaterialsView from "../views/MaterialsView.vue";
import { validateAccessTokenApi } from "../api/auth.api";
import { prepareUserStore } from "../api/users.api";
import { checkAccessApi } from "../api/system.api";
import { logout } from "../utils/auth";

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
    await validateAccessTokenApi()
    const hasAccess = await checkAccessApi()
    console.log('HAS ACCESS', hasAccess);
    
    store.isAuth = hasAccess;
    if (!hasAccess) {
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
            /**
             * Доп проверка на то есть ли у пользователя доступ к приложению. Если нет, то происходит разлогин
             */
            // const isValid = await validateAccessTokenApi()
            // if(isValid !== true) {
            //     return void logout();
            // }
            console.log('ЭТОТ БЛОК');
            
            if(!await checkAccessApi()) {
                return void logout();
            }
            else {
                await prepareUserStore();
            }
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
