import { ClockIcon } from "@heroicons/react/outline";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

import { useToggleQuery } from "@lib/hooks/useToggleQuery";
import showToast from "@lib/notification";
import { trpc } from "@lib/trpc";

import { Dialog, DialogContent } from "@components/Dialog";
import Loader from "@components/Loader";
import Shell from "@components/Shell";
import { Alert } from "@components/ui/Alert";
import Button from "@components/ui/Button";

function convertMinsToHrsMins(mins: number) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  const hours = h < 10 ? "0" + h : h;
  const minutes = m < 10 ? "0" + m : m;
  return `${hours}:${minutes}`;
}
export default function Availability() {
  const queryMe = trpc.useQuery(["viewer.me"]);
  const formModal = useToggleQuery("edit");

  const formMethods = useForm<{
    startHours: string;
    startMins: string;
    endHours: string;
    endMins: string;
    bufferHours: string;
    bufferMins: string;
  }>({});
  const router = useRouter();

  useEffect(() => {
    /**
     * This hook populates the form with new values as soon as the user is loaded or changes
     */
    const user = queryMe.data;
    if (formMethods.formState.isDirty || !user) {
      return;
    }
    formMethods.reset({
      startHours: convertMinsToHrsMins(user.startTime).split(":")[0],
      startMins: convertMinsToHrsMins(user.startTime).split(":")[1],
      endHours: convertMinsToHrsMins(user.endTime).split(":")[0],
      endMins: convertMinsToHrsMins(user.endTime).split(":")[1],
      bufferHours: convertMinsToHrsMins(user.bufferTime).split(":")[0],
      bufferMins: convertMinsToHrsMins(user.bufferTime).split(":")[1],
    });
  }, [formMethods, queryMe.data]);

  if (queryMe.status === "loading") {
    return <Loader />;
  }
  if (queryMe.status !== "success") {
    return <Alert severity="error" title="Something went wrong" />;
  }
  const user = queryMe.data;

  return (
    <div>
      <Shell heading="Availability" subtitle="Configure times when you are available for bookings.">
        <div className="flex">
          <div className="w-1/2 mr-2 bg-white border border-gray-200 rounded-sm">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Change the start and end times of your day
              </h3>
              <div className="mt-2 max-w-xl text-sm text-gray-500">
                <p>
                  Currently, your day is set to start at {convertMinsToHrsMins(user.startTime)} and end at{" "}
                  {convertMinsToHrsMins(user.endTime)}.
                </p>
              </div>
              <div className="mt-5">
                <Button href={formModal.hrefOn}>Change available times</Button>
              </div>
            </div>
          </div>

          <div className="w-1/2 ml-2 border border-gray-200 rounded-sm">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Something doesn&apos;t look right?
              </h3>
              <div className="mt-2 max-w-xl text-sm text-gray-500">
                <p>Troubleshoot your availability to explore why your times are showing as they are.</p>
              </div>
              <div className="mt-5">
                <Link href="/availability/troubleshoot">
                  <a className="btn btn-white">Launch troubleshooter</a>
                </Link>
              </div>
            </div>
          </div>
        </div>

        <Dialog
          open={formModal.isOn}
          onOpenChange={(isOpen) => {
            router.push(isOpen ? formModal.hrefOn : formModal.hrefOff);
          }}>
          <DialogContent>
            <div className="sm:flex sm:items-start mb-4">
              <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-neutral-100 sm:mx-0 sm:h-10 sm:w-10">
                <ClockIcon className="h-6 w-6 text-neutral-600" />
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                  Change your available times
                </h3>
                <div>
                  <p className="text-sm text-gray-500">
                    Set the start and end time of your day and a minimum buffer between your meetings.
                  </p>
                </div>
              </div>
            </div>
            <form
              onSubmit={formMethods.handleSubmit(async (values) => {
                const startMins = parseInt(values.startHours) * 60 + parseInt(values.startMins);
                const endMins = parseInt(values.endHours) * 60 + parseInt(values.endMins);
                const bufferMins = parseInt(values.bufferHours) * 60 + parseInt(values.bufferMins);

                // TODO: Add validation
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const response = await fetch("/api/availability/day", {
                  method: "PATCH",
                  body: JSON.stringify({ start: startMins, end: endMins, buffer: bufferMins }),
                  headers: {
                    "Content-Type": "application/json",
                  },
                });
                if (!response.ok) {
                  showToast("Something went wrong", "error");
                  return;
                }
                await queryMe.refetch();
                router.push(formModal.hrefOff);

                showToast("The start and end times for your day have been changed successfully.", "success");
              })}>
              <div className="flex mb-4">
                <label className="w-1/4 pt-2 block text-sm font-medium text-gray-700">Start time</label>
                <div>
                  <label htmlFor="startHours" className="sr-only">
                    Hours
                  </label>
                  <input
                    {...formMethods.register("startHours")}
                    id="startHours"
                    type="number"
                    className="shadow-sm focus:ring-neutral-500 focus:border-neutral-500 block w-full sm:text-sm border-gray-300 rounded-sm"
                    placeholder="9"
                    defaultValue={convertMinsToHrsMins(user.startTime).split(":")[0]}
                  />
                </div>
                <span className="mx-2 pt-1">:</span>
                <div>
                  <label htmlFor="startMins" className="sr-only">
                    Minutes
                  </label>
                  <input
                    {...formMethods.register("startMins")}
                    id="startMins"
                    type="number"
                    className="shadow-sm focus:ring-neutral-500 focus:border-neutral-500 block w-full sm:text-sm border-gray-300 rounded-sm"
                    placeholder="30"
                  />
                </div>
              </div>
              <div className="flex mb-4">
                <label className="w-1/4 pt-2 block text-sm font-medium text-gray-700">End time</label>
                <div>
                  <label htmlFor="endHours" className="sr-only">
                    Hours
                  </label>
                  <input
                    {...formMethods.register("endHours")}
                    type="number"
                    id="endHours"
                    className="shadow-sm focus:ring-neutral-500 focus:border-neutral-500 block w-full sm:text-sm border-gray-300 rounded-sm"
                    placeholder="17"
                  />
                </div>
                <span className="mx-2 pt-1">:</span>
                <div>
                  <label htmlFor="endMins" className="sr-only">
                    Minutes
                  </label>
                  <input
                    {...formMethods.register("endMins")}
                    type="number"
                    id="endMins"
                    className="shadow-sm focus:ring-neutral-500 focus:border-neutral-500 block w-full sm:text-sm border-gray-300 rounded-sm"
                    placeholder="30"
                  />
                </div>
              </div>
              <div className="flex mb-4">
                <label className="w-1/4 pt-2 block text-sm font-medium text-gray-700">Buffer</label>
                <div>
                  <label htmlFor="bufferHours" className="sr-only">
                    Hours
                  </label>
                  <input
                    {...formMethods.register("bufferHours")}
                    type="number"
                    id="bufferHours"
                    className="shadow-sm focus:ring-neutral-500 focus:border-neutral-500 block w-full sm:text-sm border-gray-300 rounded-sm"
                    placeholder="0"
                  />
                </div>
                <span className="mx-2 pt-1">:</span>
                <div>
                  <label htmlFor="bufferMins" className="sr-only">
                    Minutes
                  </label>
                  <input
                    {...formMethods.register("bufferMins")}
                    type="number"
                    id="bufferMins"
                    className="shadow-sm focus:ring-neutral-500 focus:border-neutral-500 block w-full sm:text-sm border-gray-300 rounded-sm"
                    placeholder="10"
                  />
                </div>
              </div>
              <div className="mt-5 sm:mt-4 sm:flex space-x-2">
                <Button href={formModal.hrefOff} color="secondary" tabIndex={-1}>
                  Cancel
                </Button>
                <Button type="submit" loading={formMethods.formState.isSubmitting}>
                  Update
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </Shell>
    </div>
  );
}
