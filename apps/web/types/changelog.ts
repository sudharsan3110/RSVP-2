type ChangelogData = {
  releaseDate: Date;
  version: string;
  bannerImageUrl: string;
  contributors: string[];
  features?: Features[];
  improvements?: Features[];
  bugFixes?: Features[];
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
  features: Features[];
  improvements: Features[];
  bugFixes: Features[];
  constructor({
    releaseDate,
    bannerImageUrl,
    version,
    contributors,
    features = [],
    improvements = [],
    bugFixes = [],
  }: ChangelogData) {
    this.releaseDate = releaseDate;
    this.bannerImageUrl = bannerImageUrl;
    this.version = version;
    this.contributors = contributors;
    this.features = features;
    this.improvements = improvements;
    this.bugFixes = bugFixes;
  }
}

export default Changelog;
