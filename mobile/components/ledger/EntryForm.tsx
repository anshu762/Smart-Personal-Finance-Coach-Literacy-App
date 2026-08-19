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
import { Banner, Button, Chip, Input } from "@/components/ui";
import { CATEGORY_LISTS } from "@/constants/categories";
import { useCreateEntry, useUpdateEntry, type LedgerEntry } from "@/hooks/useLedger";
import { getErrorIssues, getErrorMessage } from "@/lib/api";
import { formatDateGroupLabel, toISODateString } from "@/lib/format";

const entryFormSchema = z.object({
  type: z.enum(["INCOME", "EXPENSE"], {
    errorMap: () => ({ message: "Choose income or expense" }),
  }),
  category: z.string().min(1, "Choose a category"),
  amount: z
    .string()
    .min(1, "Enter an amount")
    .refine((value) => {
      const number = Number(value);
      return Number.isFinite(number) && number > 0;
    }, "Enter an amount greater than 0")
    .refine((value) => Number(value) <= 999_999_999, "Amount is too large"),
  date: z.string().min(1, "Pick a date"),
  note: z.string().max(280, "Note must be 280 characters or fewer"),
});

type EntryFormValues = z.infer<typeof entryFormSchema>;

export interface EntryFormProps {
  visible: boolean;
  initialValues?: LedgerEntry | null;
  isOffline?: boolean;
  onClose: () => void;
}

export function EntryForm({
  visible,
  initialValues,
  isOffline = false,
  onClose,
}: EntryFormProps) {
  const createEntry = useCreateEntry();
  const updateEntry = useUpdateEntry();
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
  } = useForm<EntryFormValues>({
    resolver: zodResolver(entryFormSchema),
    defaultValues: {
      type: "EXPENSE",
      category: "",
      amount: "",
      note: "",
      date: toISODateString(new Date()),
    },
  });

  const entryType = useWatch({ control, name: "type" });
  const currentDate = useWatch({ control, name: "date" });
  const currentCategory = useWatch({ control, name: "category" });
  const categories = CATEGORY_LISTS[entryType];
  const isPending = createEntry.isPending || updateEntry.isPending;

  useEffect(() => {
    if (visible) {
      if (initialValues) {
        reset({
          type: initialValues.type,
          category: initialValues.category,
          amount: String(initialValues.amount),
          note: initialValues.note ?? "",
          date: initialValues.date,
        });
      } else {
        reset({
          type: "EXPENSE",
          category: "",
          amount: "",
          note: "",
          date: toISODateString(new Date()),
        });
      }
    }
  }, [visible, initialValues, reset]);

  const handleTypeChange = (type: "INCOME" | "EXPENSE") => {
    if (type !== entryType) {
      const nextCategories = CATEGORY_LISTS[type];
      if (!nextCategories.includes(currentCategory)) {
        setValue("category", "");
      }
      setValue("type", type);
    }
  };

  const onDateChange = (event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === "android") {
      setShowDatePicker(false);
    }
    if (event.type === "set" && date) {
      setValue("date", toISODateString(date));
    }
  };

  const onSubmit = (values: EntryFormValues) => {
    const payload = {
      type: values.type,
      category: values.category,
      amount: Number(values.amount),
      note: values.note.trim() || undefined,
      date: values.date,
    };

    const handleServerIssues = (error: unknown) => {
      const issues = getErrorIssues(error);
      if (issues) {
        for (const [field, messages] of Object.entries(issues)) {
          setError(field as keyof EntryFormValues, { message: messages[0] });
        }
      }
    };

    if (editingId) {
      updateEntry.mutate(
        { id: editingId, input: payload },
        {
          onSuccess: onClose,
          onError: handleServerIssues,
        },
      );
    } else {
      createEntry.mutate(payload, {
        onSuccess: onClose,
        onError: handleServerIssues,
      });
    }
  };

  const submitError =
    createEntry.isError || updateEntry.isError
      ? getErrorMessage(createEntry.error ?? updateEntry.error)
      : null;

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
            {isEditing ? "Edit entry" : "Add entry"}
          </Text>
          <Pressable onPress={onClose} hitSlop={8}>
            <Text className="text-sm text-muted">Cancel</Text>
          </Pressable>
        </View>

        {isOffline ? (
          <View className="px-4 pt-3">
            <Banner message="You're offline. Entries can't be saved right now." variant="warning" />
          </View>
        ) : null}

        <ScrollView
          className="flex-1 px-4"
          keyboardShouldPersistTaps="handled"
        >
          <View className="mt-5 flex-row gap-3">
            <View className="flex-1">
              <Button
                title="Expense"
                variant={entryType === "EXPENSE" ? "primary" : "secondary"}
                size="sm"
                fullWidth
                onPress={() => handleTypeChange("EXPENSE")}
              />
            </View>
            <View className="flex-1">
              <Button
                title="Income"
                variant={entryType === "INCOME" ? "primary" : "secondary"}
                size="sm"
                fullWidth
                onPress={() => handleTypeChange("INCOME")}
              />
            </View>
          </View>

          <Text className="mb-2 mt-5 text-sm font-medium text-white">
            Category
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {categories.map((category) => (
              <Controller
                key={category}
                control={control}
                name="category"
                render={({ field: { value, onChange } }) => (
                  <Chip
                    label={category}
                    selected={value === category}
                    onPress={() => onChange(category)}
                  />
                )}
              />
            ))}
          </View>
          {errors.category?.message ? (
            <Text className="mt-2 text-xs text-danger">
              {errors.category.message}
            </Text>
          ) : null}

          <Controller
            control={control}
            name="amount"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Amount"
                placeholder="0.00"
                keyboardType="decimal-pad"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.amount?.message}
                className="mt-5"
              />
            )}
          />

          <Text className="mb-1.5 mt-5 text-sm font-medium text-white">Date</Text>
          <Pressable
            onPress={() => setShowDatePicker(true)}
            className="flex-row items-center justify-between rounded-lg border border-border bg-surface px-3 py-3"
          >
            <Text className="text-base text-white">
              {formatDateGroupLabel(currentDate)}
            </Text>
            <Text className="text-sm text-primary">Change</Text>
          </Pressable>
          {errors.date?.message ? (
            <Text className="mt-1 text-xs text-danger">{errors.date.message}</Text>
          ) : null}

          {showDatePicker ? (
            <DateTimePicker
              value={new Date(currentDate)}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={onDateChange}
              maximumDate={new Date()}
              themeVariant="dark"
            />
          ) : null}

          <Controller
            control={control}
            name="note"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Note (optional)"
                placeholder="Add a short note"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.note?.message}
                className="mt-5 mb-2"
              />
            )}
          />

          {submitError ? (
            <Text className="mb-3 text-sm text-danger">{submitError}</Text>
          ) : null}

          <Button
            title={isEditing ? "Save changes" : "Add entry"}
            fullWidth
            loading={isPending || isSubmitting}
            disabled={isPending || isSubmitting || isOffline}
            onPress={handleSubmit(onSubmit)}
            className="mb-8 mt-2"
          />
        </ScrollView>
      </View>
    </Modal>
  );
}