# Vue 3 + TypeScript + Vite

This template should help get you started developing with Vue 3 and TypeScript in Vite. The template uses Vue 3 `<script setup>` SFCs, check out the [script setup docs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup) to learn more.

## Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur) + [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin).

## Type Support For `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin) to make the TypeScript language service aware of `.vue` types.

If the standalone TypeScript plugin doesn't feel fast enough to you, Volar has also implemented a [Take Over Mode](https://github.com/johnsoncodehk/volar/discussions/471#discussioncomment-1361669) that is more performant. You can enable it by the following steps:

1. Disable the built-in TypeScript Extension
   1. Run `Extensions: Show Built-in Extensions` from VSCode's command palette
   2. Find `TypeScript and JavaScript Language Features`, right click and select `Disable (Workspace)`
2. Reload the VSCode window by running `Developer: Reload Window` from the command palette.




Стек: electron, TS, ES6, primevue, Vue3 CompositionAPI, Vite
Суть приложения:
Это многофункциональное приложение в котором на данный момент реализовано только создание, хранение материалов в виде простых текстовых статей. 
то есть выглядит так, главный экран поделен на две части:
1. Панель навигации в котором простое рекурсивное меню с расширяющимеся вкладками
(одна вкладка может содержать подвкладки) Каждая конечная вкладка определяет роут приложения.
2. Главная main панель в которой отрисовывается контент относящийся к тому или иному роуту.

На данный момент есть вкладка materials которая содержит в себе разделы и подразделы. Что такое раздел?
Раздел - это по сути корень некоторой темы (например JavaScript - это раздел который заключает в себя всё что касается про JS, он и является корнем а все подразделы будут частями этой общей темы)
Вкладки материалов рекурсивны - то есть мы до бесконечности можем создавать подразделы в некотором определенном разделе.

Хранение данных:
данные хранятся просто в файловой системе пользователя (в appData в контексте electron)
Материалы хранятся в файле materials.json.
Не использую никакую СУБД, всё управление данными происходит через нативные файловые дескрипторы NodeJS
Также по ТЗ все файлы должны быть зашифрованны через AES-CBC - пока этого нет, но это должно быть и подписываться данные при шифровании должны ключом APP_KEY из .env. 

Есть система регистрации и авторизации основанная на токене доступа с payload.
Ролей в системе нет. 
Кеширования данных в реалтайме нет, вот нужно будет настроить, чтобы разгрузить частое чтение файлов.

В будущем в этом приложении также должна быть возможность хранить медиа-данные.