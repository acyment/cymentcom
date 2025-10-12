import React from 'react';
import { useParams } from '@tanstack/react-router';

import { useIsMobile } from '@/hooks/useIsMobile';
import CourseDetail from './CourseDetail';
import Sections from './Sections';
import DesktopCourseExperience from './DesktopCourseExperience';

export default function CourseDetailRoute() {
  const { slug } = useParams({ from: '/cursos/$slug' });
  const isMobile = useIsMobile();

  if (isMobile) {
    return <CourseDetail />;
  }

  return <DesktopCourseExperience slug={slug} SectionsComponent={Sections} />;
}
