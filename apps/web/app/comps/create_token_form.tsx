"use client";

import { useActionState, useEffect, useMemo } from "react";

import { memoize, useForm } from "@conform-to/react/future";
import { isSymbolUnique } from "@/app/data/is_symbol_unique";

import { CreateTokenSchema } from "@/app/utils/schemas";
import { createToken } from "@/app/actions/create_token";

import { usePayer } from "@/app/hooks/use_payer";

import { ImageChooser } from "@/app/comps/image_chooser";
import { PreviewImage } from "@/app/comps/preview_image";
import { Field } from "@/app/comps/field";
import { SubmitButton } from "@/app/comps/submit_button";

import { useImage } from "@/app/context/image_context";
import { useSignAndSendTx } from "@/app/hooks/use_sign_and_send_tx";

import { Toast } from "@/app/comps/toast";
import { type ToastDescription, useToast } from "@/app/hooks/use_toast";

export function Form() {
  const [lastResult, formAction, isPending] = useActionState(createToken, null);

  const validateSymbol = useMemo(() => memoize(isSymbolUnique), []);

  const { clearImage, data: image } = useImage();

  const { form, fields } = useForm(CreateTokenSchema, {
    lastResult,
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
    async onValidate({ payload, error }) {
      if (typeof payload.symbol === "string" && !error.fieldErrors.symbol) {
        const valid = await validateSymbol(payload.symbol);

        if (!valid) {
          error.fieldErrors.symbol = ["Symbol already in use"];
        }
      }

      return error;
    },
  });

  const { serializedTx, errMessage, requestId } = lastResult || {};

  const create = useSignAndSendTx(serializedTx);

  const { isLoading, setError } = create;

  useEffect(() => {
    if (errMessage) {
      setError(errMessage);
    }
  }, [errMessage, setError, requestId]);

  const { getToastProps } = useToast(create);

  const payer = usePayer();

  const config: ToastDescription = {
    loading: `Generating token`,
    success: `Token ready`,
  };

  return (
    <>
      <div className="relative z-10 m-auto flex w-full flex-col divide-zinc-600 overflow-hidden rounded-2xl bg-background-100 opacity-[1] shadow-lg shadow-black/40 ">
        <PreviewImage />

        <form
          {...form.props}
          className="z-10 h-full w-full min-w-0 bg-secondary-background"
          action={(formData) => {
            formData.delete("file");
            formAction(formData);
            clearImage();
          }}
        >
          <fieldset className="relative flex w-full flex-1 items-center transition-all duration-300 flex-col gap-6">
            <div className="relative grid grid-cols-1 w-full">
              <Field
                inputProps={{
                  ...getInputProps(fields.name, { type: "text" }),
                  placeholder: "Name",
                  key: fields.name.key,
                  className: "bg-inherit",
                }}
                errors={fields.name.errors}
              />

              <Field
                inputProps={{
                  ...getInputProps(fields.symbol, { type: "text" }),
                  placeholder: "Symbol",
                  key: fields.symbol.key,
                  className: "bg-inherit",
                }}
                errors={fields.symbol.errors}
              />

              <Field
                inputProps={{
                  ...getInputProps(fields.description, { type: "text" }),
                  placeholder: "Description",
                  className: "w-full bg-inherit",
                  key: fields.description.key,
                }}
                errors={fields.description.errors}
              />
              {/* hidden inputs */}
              <input name="creator" type="hidden" defaultValue={payer} />

              <input name="image" type="hidden" defaultValue={image ?? ""} />
            </div>

            <div className="flex items-end w-full gap-2 p-3 h-[69px]">
              <div className="flex flex-1 gap-2">
                <ImageChooser />
              </div>

              <SubmitButton
                variant={"submit_1"}
                content="Submit"
                isPending={isPending}
                isLoading={isLoading}
              />
            </div>
          </fieldset>
        </form>
      </div>
      <Toast {...getToastProps(config)} />
    </>
  );
}

export function CreateTokenForm() {
  const payer = usePayer();
  // Reset serialized transaction
  return <Form key={`form-${payer}`} />;
}
