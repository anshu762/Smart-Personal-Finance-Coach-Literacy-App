import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { Modal, ScrollView, Text, View } from "react-native";
import { z } from "zod";
import { Banner, Button, Input } from "@/components/ui";
import { useAddFunds, type Goal } from "@/hooks/useGoals";
import { getErrorCode, getErrorMessage } from "@/lib/api";
import { formatCurrency } from "@/lib/format";

const addFundsSchema = z.object({
  amount: z
    .string()
    .min(1, "Enter an amount")
    .refine((value) => {
      const number = Number(value);
      return Number.isFinite(number) && number > 0;
    }, "Amount must be greater than 0")
    .refine((value) => Number(value) <= 999_999_999, "Amount is too large"),
});

type AddFundsValues = z.infer<typeof addFundsSchema>;

export interface AddFundsModalProps {
  visible: boolean;
  goal: Goal | null;
  isOffline?: boolean;
  onClose: () => void;
}

export function AddFundsModal({
  visible,
  goal,
  isOffline = false,
  onClose,
}: AddFundsModalProps) {
  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      {visible && goal ? (
        <AddFundsBody key={goal.id} goal={goal} isOffline={isOffline} onClose={onClose} />
      ) : null}
    </Modal>
  );
}

function AddFundsBody({
  goal,
  isOffline,
  onClose,
}: {
  goal: Goal;
  isOffline: boolean;
  onClose: () => void;
}) {
  const addFunds = useAddFunds();
  const [needsConfirm, setNeedsConfirm] = useState(false);
  const [overWarning, setOverWarning] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AddFundsValues>({
    resolver: zodResolver(addFundsSchema),
    defaultValues: { amount: "" },
  });

  const amountValue = useWatch({ control, name: "amount" });

  const amountNumber = Number(amountValue);
  const roomLeft = Math.max(0, goal.targetAmount - goal.savedAmount);
  const willExceed =
    Number.isFinite(amountNumber) &&
    amountNumber > 0 &&
    (roomLeft === 0 || amountNumber > roomLeft);

  const runAdd = (values: AddFundsValues, confirm: boolean) => {
    addFunds.mutate(
      {
        id: goal.id,
        input: { amount: Number(values.amount), ...(confirm ? { confirm: true } : {}) },
      },
      {
        onSuccess: onClose,
        onError: (error) => {
          setOverWarning(getErrorMessage(error));
          if (getErrorCode(error) === "GOAL_OVER_TARGET") {
            setNeedsConfirm(true);
          }
        },
      },
    );
  };

  const pending = addFunds.isPending || isSubmitting;

  return (
    <View className="flex-1 items-center justify-center bg-black/60 px-6">
      <ScrollView
        className="w-full rounded-xl border border-border bg-surface p-5"
        keyboardShouldPersistTaps="handled"
      >
        <Text className="text-lg font-semibold text-white">
          Add funds to {goal.title}
        </Text>
        <Text className="mt-1 text-sm text-muted">
          Saved {formatCurrency(goal.savedAmount)} of {formatCurrency(goal.targetAmount)}
        </Text>

        {isOffline ? (
          <View className="mt-3">
            <Banner message="You're offline. Funds can't be added right now." variant="warning" />
          </View>
        ) : null}

        {needsConfirm && overWarning ? (
          <View className="mt-3">
            <Banner message={overWarning} variant="warning" />
          </View>
        ) : null}

        <Controller
          control={control}
          name="amount"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Amount to add"
              placeholder="0.00"
              keyboardType="decimal-pad"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.amount?.message}
              className="mt-4"
            />
          )}
        />

        {!needsConfirm && willExceed ? (
          <Text className="mt-2 text-xs text-warning">
            This exceeds your target of {formatCurrency(goal.targetAmount)}.
          </Text>
        ) : null}

        <View className="mt-5 flex-row gap-3">
          <View className="flex-1">
            <Button
              title="Cancel"
              variant="secondary"
              fullWidth
              onPress={onClose}
              disabled={pending}
            />
          </View>
          <View className="flex-1">
            <Button
              title={needsConfirm ? "Save anyway" : "Add funds"}
              variant={needsConfirm ? "danger" : "primary"}
              fullWidth
              loading={pending}
              disabled={pending || isOffline}
              onPress={handleSubmit((values) => runAdd(values, needsConfirm))}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}