import Lv1 from '../assets/StudyTime/under2.svg';
import Lv2 from '../assets/StudyTime/under4.svg';
import Lv3 from '../assets/StudyTime/under6.svg';
import Lv4 from '../assets/StudyTime/under8.svg';
import Lv5 from '../assets/StudyTime/over8.svg';

export const getStudyTimeSvg = (durationSeconds: number) => {
    if (durationSeconds < 2 * 3600) return Lv1;
    if (durationSeconds < 4 * 3600) return Lv2;
    if (durationSeconds < 6 * 3600) return Lv3;
    if (durationSeconds < 8 * 3600) return Lv4;
    return Lv5;
};