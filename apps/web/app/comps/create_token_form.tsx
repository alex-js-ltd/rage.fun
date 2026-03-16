"use client";

import { useActionState, useEffect, useMemo } from "react";

import { memoize, useForm, FormProvider } from "@conform-to/react/future";
import { isSymbolUnique } from "@/app/data/is_symbol_unique";

import { CreateTokenSchema } from "@/app/utils/schemas";
import { createToken } from "@/app/actions/create_token";

import { usePayer } from "@/app/hooks/use_payer";

import { ImageChooser } from "@/app/comps/image_chooser";
import { PreviewImage } from "@/app/comps/preview_image";
import { Field } from "@/app/comps/ui/field";
import { SubmitButton } from "@/app/comps/submit_button";

import { useImage } from "@/app/context/image_context";
import { useSignAndSendTx } from "@/app/hooks/use_sign_and_send_tx";

import { Toast } from "@/app/comps/ui/toast";
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
    <FormProvider context={form.context}>
      <div className="relative z-10 m-auto flex w-full flex-col divide-zinc-600 overflow-hidden rounded-2xl bg-background-100 opacity-[1] shadow-lg shadow-black/40">
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
          <fieldset className="relative flex w-full flex-1 flex-col items-center gap-6 transition-all duration-300">
            <div className="relative grid w-full grid-cols-1">
              <Field
                inputProps={{
                  key: fields.name.key,
                  id: fields.name.id,
                  name: fields.name.name,
                  defaultValue: fields.name.defaultValue ?? "",
                  form: form.id,
                  placeholder: "Name",
                  className: "bg-inherit",
                  "aria-invalid": fields.name.ariaInvalid || undefined,
                  "aria-describedby": fields.name.ariaDescribedBy,
                }}
                errors={fields.name.errors}
              />

              <Field
                inputProps={{
                  key: fields.symbol.key,
                  id: fields.symbol.id,
                  name: fields.symbol.name,
                  defaultValue: fields.symbol.defaultValue ?? "",
                  form: form.id,
                  placeholder: "Symbol",
                  className: "bg-inherit",
                  "aria-invalid": fields.symbol.ariaInvalid || undefined,
                  "aria-describedby": fields.symbol.ariaDescribedBy,
                }}
                errors={fields.symbol.errors}
              />

              <Field
                inputProps={{
                  key: fields.description.key,
                  id: fields.description.id,
                  name: fields.description.name,
                  defaultValue: fields.description.defaultValue ?? "",
                  form: form.id,
                  placeholder: "Description",
                  className: "w-full bg-inherit",
                  "aria-invalid": fields.description.ariaInvalid || undefined,
                  "aria-describedby": fields.description.ariaDescribedBy,
                }}
                errors={fields.description.errors}
              />

              <input name="creator" type="hidden" defaultValue={payer} />
              <input name="image" type="hidden" defaultValue={image ?? ""} />
            </div>

            <div className="flex h-17.25 w-full items-end gap-2 p-3">
              <div className="flex flex-1 gap-2">
                <ImageChooser />
              </div>

              <SubmitButton
                variant="submit_1"
                content="Submit"
                isPending={isPending}
                isLoading={isLoading}
              />
            </div>
          </fieldset>
        </form>
      </div>

      <Toast {...getToastProps(config)} />
    </FormProvider>
  );
}

export function CreateTokenForm() {
  const payer = usePayer();
  // Reset serialized transaction
  return <Form key={`form-${payer}`} />;
}
