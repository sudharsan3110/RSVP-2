// types/changelog.ts
export type ChangelogData = {
  releaseDate: Date;
  version: string;
  bannerImageUrl: string;
  contributors: string[];
  sections?: ChangeLogSection[]; // Holds grouped features
  improvements?: Features[];
  bugFixes?: Features[];
};

export type ChangeLogSection = {
  title: string;
  items: Features[];
};

export type Features = {
  summary: string;
  contributors: string[];
};

class Changelog {
  releaseDate: Date;
  bannerImageUrl: string;
  version: string;
  contributors: string[];
  sections: ChangeLogSection[];
  improvements: Features[];
  bugFixes: Features[];

  constructor({
    releaseDate,
    bannerImageUrl,
    version,
    contributors,
    sections = [],
    improvements = [],
    bugFixes = [],
  }: ChangelogData) {
    this.releaseDate = releaseDate;
    this.bannerImageUrl = bannerImageUrl;
    this.version = version;
    this.contributors = contributors;
    this.sections = sections;
    this.improvements = improvements ?? [];
    this.bugFixes = bugFixes ?? [];
  }
}

export default Changelog;
