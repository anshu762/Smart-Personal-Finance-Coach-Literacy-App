import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { z } from "zod";
import { Banner, Button, Input } from "@/components/ui";
import {
  useCreateGoal,
  useUpdateGoal,
  type Goal,
} from "@/hooks/useGoals";
import { getErrorIssues } from "@/lib/api";
import { formatDateGroupLabel, startOfTomorrow, toISODateString } from "@/lib/format";

const goalFormSchema = z
  .object({
    title: z
      .string()
      .min(1, "Give your goal a title")
      .max(80, "Title must be 80 characters or fewer"),
    targetAmount: z
      .string()
      .min(1, "Enter a target amount")
      .refine((value) => {
        const number = Number(value);
        return Number.isFinite(number) && number > 0;
      }, "Target amount must be greater than 0")
      .refine((value) => Number(value) <= 999_999_999, "Amount is too large"),
    deadline: z.string(),
  })
  .refine(
    (data) => {
      if (!data.deadline) return true;
      return new Date(data.deadline).getTime() >= startOfTomorrow().getTime();
    },
    { message: "Deadline must be a future date", path: ["deadline"] },
  );

type GoalFormValues = z.infer<typeof goalFormSchema>;

export interface GoalFormProps {
  visible: boolean;
  initialValues?: Goal | null;
  isOffline?: boolean;
  onClose: () => void;
}

export function GoalForm({
  visible,
  initialValues,
  isOffline = false,
  onClose,
}: GoalFormProps) {
  const createGoal = useCreateGoal();
  const updateGoal = useUpdateGoal();
  const [showDatePicker, setShowDatePicker] = useState(false);

  const isEditing = Boolean(initialValues?.id);
  const editingId = initialValues?.id;

  const {
    control,
    handleSubmit,
    setError,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<GoalFormValues>({
    resolver: zodResolver(goalFormSchema),
    defaultValues: {
      title: "",
      targetAmount: "",
      deadline: "",
    },
  });

  const deadlineValue = useWatch({ control, name: "deadline" });
  const isPending = createGoal.isPending || updateGoal.isPending;

  useEffect(() => {
    if (visible) {
      if (initialValues) {
        reset({
          title: initialValues.title,
          targetAmount: String(initialValues.targetAmount),
          deadline: initialValues.deadline ?? "",
        });
      } else {
        reset({ title: "", targetAmount: "", deadline: "" });
      }
    }
  }, [visible, initialValues, reset]);

  const onDateChange = (event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === "android") {
      setShowDatePicker(false);
    }
    if (event.type === "set" && date) {
      setValue("deadline", toISODateString(date));
    }
  };

  const onSubmit = (values: GoalFormValues) => {
    const deadline = values.deadline
      ? toISODateString(new Date(values.deadline))
      : null;

    const createPayload = {
      title: values.title,
      targetAmount: Number(values.targetAmount),
      ...(deadline ? { deadline } : {}),
    };

    const updatePayload = {
      title: values.title,
      targetAmount: Number(values.targetAmount),
      deadline,
    };

    const handleServerIssues = (error: unknown) => {
      const issues = getErrorIssues(error);
      if (issues) {
        for (const [field, messages] of Object.entries(issues)) {
          setError(field as keyof GoalFormValues, { message: messages[0] });
        }
      }
    };

    if (editingId) {
      updateGoal.mutate(
        { id: editingId, input: updatePayload },
        { onSuccess: onClose, onError: handleServerIssues },
      );
    } else {
      createGoal.mutate(createPayload, { onSuccess: onClose, onError: handleServerIssues });
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-background">
        <View className="flex-row items-center justify-between border-b border-border px-4 py-4">
          <Text className="text-lg font-semibold text-white">
            {isEditing ? "Edit goal" : "New goal"}
          </Text>
          <Pressable onPress={onClose} hitSlop={8}>
            <Text className="text-sm text-muted">Cancel</Text>
          </Pressable>
        </View>

        {isOffline ? (
          <View className="px-4 pt-3">
            <Banner message="You're offline. Goals can't be saved right now." variant="warning" />
          </View>
        ) : null}

        <ScrollView className="flex-1 px-4" keyboardShouldPersistTaps="handled">
          <Controller
            control={control}
            name="title"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Goal title"
                placeholder="e.g. Emergency fund"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.title?.message}
                className="mt-5"
              />
            )}
          />

          <Controller
            control={control}
            name="targetAmount"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Target amount"
                placeholder="0.00"
                keyboardType="decimal-pad"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.targetAmount?.message}
                className="mt-5"
              />
            )}
          />

          <Text className="mb-1.5 mt-5 text-sm font-medium text-white">
            Deadline (optional)
          </Text>
          <Pressable
            onPress={() => setShowDatePicker(true)}
            className="flex-row items-center justify-between rounded-lg border border-border bg-surface px-3 py-3"
          >
            <Text className="text-base text-white">
              {deadlineValue ? formatDateGroupLabel(deadlineValue) : "No deadline"}
            </Text>
            <Text className="text-sm text-primary">
              {deadlineValue ? "Change" : "Pick a date"}
            </Text>
          </Pressable>
          {deadlineValue ? (
            <Pressable
              onPress={() => setValue("deadline", "")}
              hitSlop={4}
              className="mt-2 self-start"
            >
              <Text className="text-sm text-danger">Clear deadline</Text>
            </Pressable>
          ) : null}
          {errors.deadline?.message ? (
            <Text className="mt-2 text-xs text-danger">{errors.deadline.message}</Text>
          ) : null}

          {showDatePicker ? (
            <DateTimePicker
              value={deadlineValue ? new Date(deadlineValue) : startOfTomorrow()}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={onDateChange}
              minimumDate={startOfTomorrow()}
              themeVariant="dark"
            />
          ) : null}

          <Button
            title={isEditing ? "Save changes" : "Create goal"}
            fullWidth
            loading={isPending || isSubmitting}
            disabled={isPending || isSubmitting || isOffline}
            onPress={handleSubmit(onSubmit)}
            className="mb-8 mt-6"
          />
        </ScrollView>
      </View>
    </Modal>
  );
}