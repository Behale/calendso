import {
  DotsHorizontalIcon,
  ExternalLinkIcon,
  LinkIcon,
  PencilAltIcon,
  TrashIcon,
} from "@heroicons/react/outline";
import Link from "next/link";
import { useState } from "react";

import showToast from "@lib/notification";

import { Dialog, DialogTrigger } from "@components/Dialog";
import { Tooltip } from "@components/Tooltip";
import ConfirmationDialogContent from "@components/dialog/ConfirmationDialogContent";
import Avatar from "@components/ui/Avatar";
import Button from "@components/ui/Button";

import Dropdown, { DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/Dropdown";

interface Team {
  id: number;
  name: string | null;
  slug: string | null;
  logo: string | null;
  bio: string | null;
  role: string | null;
  hideBranding: boolean;
  prevState: null;
}

export default function TeamListItem(props: {
  onChange: () => void;
  key: number;
  team: Team;
  onActionSelect: (text: string) => void;
}) {
  const [team, setTeam] = useState<Team | null>(props.team);

  const acceptInvite = () => invitationResponse(true);
  const declineInvite = () => invitationResponse(false);

  const invitationResponse = (accept: boolean) =>
    fetch("/api/user/membership", {
      method: accept ? "PATCH" : "DELETE",
      body: JSON.stringify({ teamId: props.team.id }),
      headers: {
        "Content-Type": "application/json",
      },
    }).then(() => {
      // success
      setTeam(null);
      props.onChange();
    });

  return (
    team && (
      <li className="divide-y">
        <div className="flex justify-between my-4">
          <div className="flex">
            <Avatar
              size={9}
              imageSrc={
                props.team.logo
                  ? props.team.logo
                  : "https://eu.ui-avatars.com/api/?background=fff&color=039be5&name=" +
                    encodeURIComponent(props.team.name || "")
              }
              alt="Team Logo"
              className="rounded-full w-9 h-9"
            />
            <div className="inline-block ml-3">
              <span className="text-sm font-bold text-neutral-700">{props.team.name}</span>
              <span className="block -mt-1 text-xs text-gray-400">
                {process.env.NEXT_PUBLIC_APP_URL}/team/{props.team.slug}
              </span>
            </div>
          </div>
          {props.team.role === "INVITEE" && (
            <div>
              <Button type="button" color="secondary" onClick={declineInvite}>
                Reject
              </Button>
              <Button type="button" color="primary" className="ml-1" onClick={acceptInvite}>
                Accept
              </Button>
            </div>
          )}
          {props.team.role === "MEMBER" && (
            <div>
              <Button type="button" color="primary" onClick={declineInvite}>
                Leave
              </Button>
            </div>
          )}
          {props.team.role === "OWNER" && (
            <div className="flex space-x-4">
              <span className="self-center h-6 px-3 py-1 text-xs text-gray-700 capitalize rounded-md bg-gray-50">
                Owner
              </span>
              <Tooltip content="Copy link">
                <Button
                  onClick={() => {
                    navigator.clipboard.writeText(
                      process.env.NEXT_PUBLIC_APP_URL + "/team/" + props.team.slug
                    );
                    showToast("Link copied!", "success");
                  }}
                  size="icon"
                  color="minimal"
                  StartIcon={LinkIcon}
                  type="button"
                />
              </Tooltip>
              <Dropdown>
                <DropdownMenuTrigger className="group w-10 h-10 p-0 border border-transparent text-neutral-400 hover:border-gray-200">
                  <DotsHorizontalIcon className="w-5 h-5" />
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>
                    <Button
                      type="button"
                      color="minimal"
                      className="w-full"
                      onClick={() => props.onActionSelect("edit")}
                      StartIcon={PencilAltIcon}>
                      Edit team
                    </Button>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link href={`${process.env.NEXT_PUBLIC_APP_URL}/team/${props.team.slug}`} passHref={true}>
                      <a target="_blank">
                        <Button type="button" color="minimal" className="w-full" StartIcon={ExternalLinkIcon}>
                          Preview team page
                        </Button>
                      </a>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                          color="warn"
                          StartIcon={TrashIcon}
                          className="w-full">
                          Disband Team
                        </Button>
                      </DialogTrigger>
                      <ConfirmationDialogContent
                        variety="danger"
                        title="Disband Team"
                        confirmBtnText="Yes, disband team"
                        cancelBtnText="Cancel"
                        onConfirm={() => props.onActionSelect("disband")}>
                        Are you sure you want to disband this team? Anyone who you&apos;ve shared this team
                        link with will no longer be able to book using it.
                      </ConfirmationDialogContent>
                    </Dialog>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </Dropdown>
            </div>
          )}
        </div>
      </li>
    )
  );
}
