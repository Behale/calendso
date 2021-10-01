import { ArrowRightIcon } from "@heroicons/react/outline";
import { ArrowLeftIcon } from "@heroicons/react/solid";
import classnames from "classnames";
import Link from "next/link";
import React from "react";

import Avatar from "@components/ui/Avatar";
import Button from "@components/ui/Button";
import Text from "@components/ui/Text";

const Team = ({ team }) => {
  const Member = ({ member }) => {
    const classes = classnames(
      "group",
      "relative",
      "flex flex-col",
      "space-y-4",
      "p-4",
      "bg-white dark:bg-neutral-900 dark:border-0 dark:bg-opacity-8",
      "border border-neutral-200",
      "hover:cursor-pointer",
      "hover:border-black dark:border-neutral-700 dark:hover:border-neutral-600",
      "rounded-sm",
      "hover:shadow-md"
    );

    return (
      <Link key={member.id} href={`/${member.user.username}`}>
        <div className={classes}>
          <ArrowRightIcon
            className={classnames(
              "text-black dark:text-white",
              "absolute top-4 right-4",
              "h-4 w-4",
              "transition-opacity",
              "opacity-0 group-hover:opacity-100 group-hover:block"
            )}
          />

          <div>
            <Avatar displayName={member.user.name} imageSrc={member.user.avatar} className="w-12 h-12" />
            <section className="space-y-2">
              <Text variant="title">{member.user.name}</Text>
              <Text variant="subtitle" className="w-6/8">
                {member.user.bio}
              </Text>
            </section>
          </div>
        </div>
      </Link>
    );
  };

  const Members = ({ members }) => {
    if (!members || members.length === 0) {
      return null;
    }

    return (
      <section className="mx-auto min-w-full lg:min-w-lg max-w-5xl flex flex-wrap gap-x-12 gap-y-6 justify-center">
        {members.map((member) => {
          return member.user.username !== null && <Member key={member.id} member={member} />;
        })}
      </section>
    );
  };

  return (
    <div>
      <Members members={team.members} />
      {team.eventTypes.length > 0 && (
        <aside className="text-center dark:text-white mt-8">
          <Button color="secondary" href={`/team/${team.slug}`} shallow={true} StartIcon={ArrowLeftIcon}>
            Go back
          </Button>
        </aside>
      )}
    </div>
  );
};

export default Team;
