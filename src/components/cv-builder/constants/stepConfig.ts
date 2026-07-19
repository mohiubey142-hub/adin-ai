import { 
  User, Briefcase, GraduationCap, Code2, FileText, 
  FolderGit2, Languages, Award, Trophy, Eye 
} from 'lucide-react';

export const stepIcons = [
    { num: 1, name: 'Personal', icon: User },
    { num: 2, name: 'Experience', icon: Briefcase },
    { num: 3, name: 'Education', icon: GraduationCap },
    { num: 4, name: 'Languages', icon: Languages },
    { num: 5, name: 'Skills', icon: Code2 },
    { num: 6, name: 'Certifications', icon: Award },
    { num: 7, name: 'Projects', icon: FolderGit2 },
    { num: 8, name: 'Achievements', icon: Trophy },
    { num: 9, name: 'Summary', icon: FileText },
    { num: 10, name: 'Preview', icon: Eye },
];

export const requiredSteps = [1, 3, 5, 9, 10];

export const stepNames = stepIcons.reduce((acc, s) => ({ 
    ...acc, 
    [s.num]: s.name 
}), {});