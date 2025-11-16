import { Topics, Level, Topic } from "./topics";

function pick<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Возвращает случайную тему.
 * Если уровень передан — берём только эту группу.
 * Если нет — выбираем из всех.
 */
export function getRandomTopic(level?: Level): Topic {
    if (level && Topics[level]) {
        return pick(Topics[level]);
    }

    // объединяем все темы
    const all = [
        ...Topics.A1,
        ...Topics.A2,
        ...Topics.B1,
        ...Topics.B2,
        ...Topics.C1,
    ];

    return pick(all);
}