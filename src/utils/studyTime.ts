export const getStudyTimeSvg = (durationSeconds: number) => {
    if (durationSeconds < 2 * 3600) return "https://actionary-s3-bucket-v2.s3.ap-northeast-2.amazonaws.com/static/study_time_calendar/under2.png";
    if (durationSeconds < 4 * 3600) return "https://actionary-s3-bucket-v2.s3.ap-northeast-2.amazonaws.com/static/study_time_calendar/under4.png";
    if (durationSeconds < 6 * 3600) return "https://actionary-s3-bucket-v2.s3.ap-northeast-2.amazonaws.com/static/study_time_calendar/under6.png";
    if (durationSeconds < 8 * 3600) return "https://actionary-s3-bucket-v2.s3.ap-northeast-2.amazonaws.com/static/study_time_calendar/under8.png";
    return "https://actionary-s3-bucket-v2.s3.ap-northeast-2.amazonaws.com/static/study_time_calendar/over8.png";
};