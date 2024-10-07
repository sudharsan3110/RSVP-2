import Image from "next/image";
import Logo from "./Logo";
import { cn } from "@/lib/utils";
import Container from "./Container";
import { buttonVariants } from "../ui/button";

const Footer = ({ className }: PropsWithClassName) => {
  return (
    <footer data-testid="footer" className={cn("footer border-t", className)}>
      <div className="bg-black py-6">
        <Container className="flex flex-col justify-between sm:flex-row">
          <div>
            <Logo className="mb-4 h-10 w-fit" />
            <div className="flex items-end space-x-2">
              <p className="font-semibold leading-none">
                Powered By
                <a href="https://team.shiksha" className="hover:underline">
                  {" "}
                  Team.Shiksha
                </a>
              </p>
              <Image
                priority
                src="/images/team-shiksha-logo.svg"
                width={50}
                height={50}
                className="h-5"
                alt="Team.Shiksha Logo"
                data-testid="team-shiksha-logo"
              />
            </div>
          </div>
          <div className="mt-auto">
            <ul className="space-y-4">
              <li>
                <a
                  href="https://github.com/TeamShiksha"
                  target="_blank"
                  className={cn(
                    buttonVariants({ variant: "link", size: "sm" }),
                    "px-0",
                  )}
                  data-testid="github-link"
                >
                  Github
                </a>
              </li>
              <li className="text-sm">
                © 2023 Team Shiksha. All rights reserved.
              </li>
            </ul>
          </div>
        </Container>
      </div>
    </footer>
  );
};

export default Footer;
