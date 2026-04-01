"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import {
  Image as ImageIcon,
  Search,
  SlidersHorizontal,
  TriangleAlert,
  X,
} from "lucide-react";
import LinkButton from "@/components/LinkButton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { FieldLegend, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  buildCarrierName,
  formatAvailabilityStatus,
  formatCarrierType,
  getAvailabilityBadgeVariant,
  type AvailabilityStatus,
} from "@/lib/carriers";
import { cn } from "@/lib/utils";

export type CarrierListItem = {
  instanceId: string;
  brand: string;
  model: string | null;
  size: string | null;
  type: string;
  material: string | null;
  colorPattern: string | null;
  issues: string | null;
  image: string | null;
  availabilityStatus: AvailabilityStatus;
};

type FiltersState = {
  search: string;
  statuses: CarrierListItem["availabilityStatus"][];
  brands: string[];
  types: string[];
  sizes: string[];
  materials: string[];
  onlyWithIssues: boolean;
  onlyWithImages: boolean;
  sort: "availability" | "brand_asc" | "brand_desc";
};

type FacetOption = {
  value: string;
  label: string;
  count: number;
};

const defaultFilters: FiltersState = {
  search: "",
  statuses: [],
  brands: [],
  types: [],
  sizes: [],
  materials: [],
  onlyWithIssues: false,
  onlyWithImages: false,
  sort: "availability",
};

function normalizeText(value: string | null | undefined) {
  return value?.trim().toLowerCase() ?? "";
}

function makeFilterId(...parts: string[]) {
  return parts
    .map((part) => normalizeText(part).replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""))
    .filter(Boolean)
    .join("-");
}

function toggleValue(values: string[], value: string) {
  return values.includes(value)
    ? values.filter((entry) => entry !== value)
    : [...values, value];
}

function buildFacetOptions(
  items: CarrierListItem[],
  getValue: (item: CarrierListItem) => string | null,
  formatLabel?: (value: string) => string
) {
  const counts = new Map<string, number>();

  for (const item of items) {
    const value = getValue(item)?.trim();
    if (!value) continue;
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }

  return [...counts.entries()]
    .map(([value, count]) => ({
      value,
      label: formatLabel ? formatLabel(value) : value,
      count,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

function getStatusRank(status: CarrierListItem["availabilityStatus"]) {
  switch (status) {
    case "available":
      return 0;
    case "checked_out":
      return 1;
    case "maintenance":
      return 2;
    case "retired":
      return 3;
    default:
      return 4;
  }
}

function matchesSearch(item: CarrierListItem, search: string) {
  if (!search) return true;

  const haystack = [
    item.brand,
    item.model,
    item.size,
    formatCarrierType(item.type),
    item.material,
    item.colorPattern,
    item.issues,
  ]
    .filter(Boolean)
    .join(" ");

  return normalizeText(haystack).includes(search);
}

function getActiveFilterCount(filters: FiltersState) {
  let count = 0;
  if (filters.search) count += 1;
  if (filters.statuses.length > 0) count += 1;
  if (filters.brands.length > 0) count += 1;
  if (filters.types.length > 0) count += 1;
  if (filters.sizes.length > 0) count += 1;
  if (filters.materials.length > 0) count += 1;
  if (filters.onlyWithIssues) count += 1;
  if (filters.onlyWithImages) count += 1;
  return count;
}

type FiltersPanelProps = {
  filters: FiltersState;
  statusOptions: FacetOption[];
  brandOptions: FacetOption[];
  typeOptions: FacetOption[];
  sizeOptions: FacetOption[];
  materialOptions: FacetOption[];
  updateFilters: (next: Partial<FiltersState>) => void;
  clearFilters: () => void;
  idPrefix: string;
  showIntro?: boolean;
  showClearButton?: boolean;
};

function FiltersPanel({
  filters,
  statusOptions,
  brandOptions,
  typeOptions,
  sizeOptions,
  materialOptions,
  updateFilters,
  clearFilters,
  idPrefix,
  showIntro = true,
  showClearButton = true,
}: FiltersPanelProps) {
  const hasActiveFilters = getActiveFilterCount(filters) > 0;

  return (
    <div className="flex flex-col gap-5">
      {showIntro ? (
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="font-heading text-base font-medium">Filters</h2>
            <p className="text-sm text-muted-foreground">
              Narrow the carrier library by fit, style, and availability.
            </p>
          </div>
          {showClearButton && hasActiveFilters ? (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Clear all
            </Button>
          ) : null}
        </div>
      ) : null}

      <FilterSection title="Availability">
        {statusOptions.map((option) => (
          <FilterCheckbox
            key={option.value}
            id={makeFilterId(idPrefix, "status", option.value)}
            label={option.label}
            count={option.count}
            checked={filters.statuses.includes(
              option.value as CarrierListItem["availabilityStatus"]
            )}
            onCheckedChange={() =>
              updateFilters({
                statuses: toggleValue(filters.statuses, option.value) as CarrierListItem["availabilityStatus"][],
              })
            }
          />
        ))}
      </FilterSection>

      <Separator />

      <FilterSection title="Brand" limitedHeight>
        {brandOptions.map((option) => (
          <FilterCheckbox
            key={option.value}
            id={makeFilterId(idPrefix, "brand", option.value)}
            label={option.label}
            count={option.count}
            checked={filters.brands.includes(option.value)}
            onCheckedChange={() =>
              updateFilters({ brands: toggleValue(filters.brands, option.value) })
            }
          />
        ))}
      </FilterSection>

      <Separator />

      <FilterSection title="Carrier type">
        {typeOptions.map((option) => (
          <FilterCheckbox
            key={option.value}
            id={makeFilterId(idPrefix, "type", option.value)}
            label={option.label}
            count={option.count}
            checked={filters.types.includes(option.value)}
            onCheckedChange={() =>
              updateFilters({ types: toggleValue(filters.types, option.value) })
            }
          />
        ))}
      </FilterSection>

      {sizeOptions.length > 0 ? (
        <>
          <Separator />
          <FilterSection title="Size">
            {sizeOptions.map((option) => (
              <FilterCheckbox
                key={option.value}
                id={makeFilterId(idPrefix, "size", option.value)}
                label={option.label}
                count={option.count}
                checked={filters.sizes.includes(option.value)}
                onCheckedChange={() =>
                  updateFilters({ sizes: toggleValue(filters.sizes, option.value) })
                }
              />
            ))}
          </FilterSection>
        </>
      ) : null}

      {materialOptions.length > 0 ? (
        <>
          <Separator />
          <FilterSection title="Material" limitedHeight>
            {materialOptions.map((option) => (
              <FilterCheckbox
                key={option.value}
                id={makeFilterId(idPrefix, "material", option.value)}
                label={option.label}
                count={option.count}
                checked={filters.materials.includes(option.value)}
                onCheckedChange={() =>
                  updateFilters({
                    materials: toggleValue(filters.materials, option.value),
                  })
                }
              />
            ))}
          </FilterSection>
        </>
      ) : null}

      <Separator />

      <FilterSection title="Library notes">
        <FilterCheckbox
          id={makeFilterId(idPrefix, "notes", "issues")}
          label="Only show carriers with issues listed"
          checked={filters.onlyWithIssues}
          onCheckedChange={() =>
            updateFilters({ onlyWithIssues: !filters.onlyWithIssues })
          }
        />
        <FilterCheckbox
          id={makeFilterId(idPrefix, "notes", "photos")}
          label="Only show carriers with photos"
          checked={filters.onlyWithImages}
          onCheckedChange={() =>
            updateFilters({ onlyWithImages: !filters.onlyWithImages })
          }
        />
      </FilterSection>
    </div>
  );
}

function FilterSection({
  title,
  children,
  limitedHeight = false,
}: {
  title: string;
  children: ReactNode;
  limitedHeight?: boolean;
}) {
  return (
    <FieldSet className="gap-3">
      <FieldLegend variant="label">{title}</FieldLegend>
      <div
        className={cn(
          "flex flex-col gap-2",
          limitedHeight && "max-h-56 overflow-y-auto pr-1"
        )}
      >
        {children}
      </div>
    </FieldSet>
  );
}

function FilterCheckbox({
  id,
  label,
  checked,
  onCheckedChange,
  count,
}: {
  id: string;
  label: string;
  checked: boolean;
  onCheckedChange: () => void;
  count?: number;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3 rounded-lg px-2 py-1.5 transition-colors hover:bg-muted/50">
      <div className="flex items-center gap-3">
        <Checkbox id={id} checked={checked} onCheckedChange={onCheckedChange} />
        <span className="text-sm">{label}</span>
      </div>
      {typeof count === "number" ? (
        <span className="text-xs text-muted-foreground">{count}</span>
      ) : null}
    </label>
  );
}

export default function CarrierBrowser({ items }: { items: CarrierListItem[] }) {
  const [filters, setFilters] = useState<FiltersState>(defaultFilters);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const statusOptions: FacetOption[] = [
    {
      value: "available",
      label: "Available",
      count: items.filter((item) => item.availabilityStatus === "available").length,
    },
    {
      value: "checked_out",
      label: "Checked out",
      count: items.filter((item) => item.availabilityStatus === "checked_out").length,
    },
    {
      value: "maintenance",
      label: "Maintenance",
      count: items.filter((item) => item.availabilityStatus === "maintenance").length,
    },
    {
      value: "retired",
      label: "Retired",
      count: items.filter((item) => item.availabilityStatus === "retired").length,
    },
  ];

  const brandOptions = buildFacetOptions(items, (item) => item.brand);
  const typeOptions = buildFacetOptions(items, (item) => item.type, formatCarrierType);
  const sizeOptions = buildFacetOptions(items, (item) => item.size);
  const materialOptions = buildFacetOptions(items, (item) => item.material);

  const normalizedSearch = normalizeText(filters.search);

  const filteredItems = items
    .filter((item) => matchesSearch(item, normalizedSearch))
    .filter((item) =>
      filters.statuses.length > 0 ? filters.statuses.includes(item.availabilityStatus) : true
    )
    .filter((item) => (filters.brands.length > 0 ? filters.brands.includes(item.brand) : true))
    .filter((item) => (filters.types.length > 0 ? filters.types.includes(item.type) : true))
    .filter((item) => (filters.sizes.length > 0 ? filters.sizes.includes(item.size ?? "") : true))
    .filter((item) =>
      filters.materials.length > 0 ? filters.materials.includes(item.material ?? "") : true
    )
    .filter((item) => (filters.onlyWithIssues ? Boolean(item.issues) : true))
    .filter((item) => (filters.onlyWithImages ? Boolean(item.image) : true))
    .sort((left, right) => {
      if (filters.sort === "brand_asc") {
        return buildCarrierName(left).localeCompare(buildCarrierName(right));
      }

      if (filters.sort === "brand_desc") {
        return buildCarrierName(right).localeCompare(buildCarrierName(left));
      }

      const rankDifference =
        getStatusRank(left.availabilityStatus) - getStatusRank(right.availabilityStatus);

      if (rankDifference !== 0) {
        return rankDifference;
      }

      return buildCarrierName(left).localeCompare(buildCarrierName(right));
    });

  const activeFilterCount = getActiveFilterCount(filters);
  const hasActiveFilters = activeFilterCount > 0;
  const filteredCarrierLabel =
    filteredItems.length === 1 ? "Show 1 carrier" : `Show ${filteredItems.length} carriers`;

  function updateFilters(next: Partial<FiltersState>) {
    setFilters((current) => ({ ...current, ...next }));
  }

  function clearFilters() {
    setFilters(defaultFilters);
  }

  if (items.length === 0) {
    return (
      <Empty className="border bg-card py-12">
        <EmptyHeader>
          <EmptyTitle>No carriers yet</EmptyTitle>
          <EmptyDescription>
            Add inventory in the admin app to start browsing the library.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <section className="grid gap-6 lg:grid-cols-[18rem_minmax(0,1fr)]">
      <aside className="hidden lg:block">
        <Card className="sticky top-6">
          <CardContent>
            <FiltersPanel
              filters={filters}
              statusOptions={statusOptions}
              brandOptions={brandOptions}
              typeOptions={typeOptions}
              sizeOptions={sizeOptions}
              materialOptions={materialOptions}
              updateFilters={updateFilters}
              clearFilters={clearFilters}
              idPrefix="desktop"
            />
          </CardContent>
        </Card>
      </aside>

      <div className="flex flex-col gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl leading-tight sm:text-base">Browse carriers</CardTitle>
            <CardDescription className="text-base leading-relaxed sm:text-sm">
              Showing {filteredItems.length} of {items.length} carriers.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={filters.search}
                onChange={(event) => updateFilters({ search: event.target.value })}
                placeholder="Search brand, model, material, color..."
                className="pl-10.5"
              />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Select
                value={filters.sort}
                onValueChange={(value) =>
                  updateFilters({ sort: value as FiltersState["sort"] })
                }
              >
                <SelectTrigger className="w-full sm:w-48" aria-label="Sort carriers">
                  <SelectValue placeholder="Sort carriers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="availability">Available first</SelectItem>
                    <SelectItem value="brand_asc">Name A-Z</SelectItem>
                    <SelectItem value="brand_desc">Name Z-A</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>

              <Button
                variant="secondary"
                size="lg"
                className="lg:hidden"
                onClick={() => setMobileFiltersOpen(true)}
              >
                <SlidersHorizontal data-icon="inline-start" />
                {activeFilterCount > 0
                  ? `Open filters (${activeFilterCount})`
                  : "Open filters"}
              </Button>
            </div>
          </CardContent>

          {hasActiveFilters ? (
            <>
              <Separator />
              <CardContent className="flex flex-wrap gap-2">
                {filters.search ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => updateFilters({ search: "" })}
                  >
                    Search: {filters.search}
                    <X data-icon="inline-end" />
                  </Button>
                ) : null}

                {filters.statuses.map((status) => (
                  <Button
                    key={status}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      updateFilters({
                        statuses: filters.statuses.filter((entry) => entry !== status),
                      })
                    }
                  >
                    {formatAvailabilityStatus(status)}
                    <X data-icon="inline-end" />
                  </Button>
                ))}

                {filters.brands.map((brand) => (
                  <Button
                    key={brand}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      updateFilters({
                        brands: filters.brands.filter((entry) => entry !== brand),
                      })
                    }
                  >
                    {brand}
                    <X data-icon="inline-end" />
                  </Button>
                ))}

                {filters.types.map((type) => (
                  <Button
                    key={type}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      updateFilters({
                        types: filters.types.filter((entry) => entry !== type),
                      })
                    }
                  >
                    {formatCarrierType(type)}
                    <X data-icon="inline-end" />
                  </Button>
                ))}

                {filters.sizes.map((size) => (
                  <Button
                    key={size}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      updateFilters({
                        sizes: filters.sizes.filter((entry) => entry !== size),
                      })
                    }
                  >
                    Size: {size}
                    <X data-icon="inline-end" />
                  </Button>
                ))}

                {filters.materials.map((material) => (
                  <Button
                    key={material}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      updateFilters({
                        materials: filters.materials.filter((entry) => entry !== material),
                      })
                    }
                  >
                    {material}
                    <X data-icon="inline-end" />
                  </Button>
                ))}

                {filters.onlyWithIssues ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => updateFilters({ onlyWithIssues: false })}
                  >
                    Has issues listed
                    <X data-icon="inline-end" />
                  </Button>
                ) : null}

                {filters.onlyWithImages ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => updateFilters({ onlyWithImages: false })}
                  >
                    Has photo
                    <X data-icon="inline-end" />
                  </Button>
                ) : null}
              </CardContent>
            </>
          ) : null}
        </Card>

        <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
          <SheetContent side="bottom" showCloseButton={false} className="max-h-[88vh] p-0">
            <SheetHeader>
              <SheetTitle>Filter carriers</SheetTitle>
              <SheetDescription>
                Refine the library without leaving the browsing view.
              </SheetDescription>
            </SheetHeader>
            <div className="overflow-y-auto px-4 pb-4">
              <FiltersPanel
                filters={filters}
                statusOptions={statusOptions}
                brandOptions={brandOptions}
              typeOptions={typeOptions}
              sizeOptions={sizeOptions}
              materialOptions={materialOptions}
              updateFilters={updateFilters}
              clearFilters={clearFilters}
              idPrefix="mobile"
              showIntro={false}
              showClearButton={false}
            />
            </div>
            <Separator />
            <SheetFooter>
              <div className="flex flex-col gap-2 sm:flex-row">
                {hasActiveFilters ? (
                  <Button variant="outline" size="lg" onClick={clearFilters}>
                    Clear all
                  </Button>
                ) : null}
                <Button size="lg" onClick={() => setMobileFiltersOpen(false)}>
                  {filteredCarrierLabel}
                </Button>
              </div>
            </SheetFooter>
          </SheetContent>
        </Sheet>

        {filteredItems.length === 0 ? (
          <Empty className="border bg-card py-12">
            <EmptyHeader>
              <EmptyTitle>No carriers match these filters</EmptyTitle>
              <EmptyDescription>
                Try widening your search or clearing a few filters to bring more of the
                library back into view.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button variant="outline" size="lg" onClick={clearFilters}>
                Reset filters
              </Button>
            </EmptyContent>
          </Empty>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredItems.map((item) => {
              const carrierName = buildCarrierName(item);

              return (
                <Card key={item.instanceId} className="h-full pt-0">
                  {item.image ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.image}
                        alt={carrierName}
                        className="aspect-[4/3] w-full bg-muted/30 object-contain"
                      />
                      <Separator />
                    </>
                  ) : (
                    <>
                      <div className="flex aspect-[4/3] items-center justify-center bg-muted/50 text-sm text-muted-foreground">
                        No photo yet
                      </div>
                      <Separator />
                    </>
                  )}

                  <CardHeader>
                    <CardDescription>{formatCarrierType(item.type)}</CardDescription>
                    <CardTitle>{carrierName}</CardTitle>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant={getAvailabilityBadgeVariant(item.availabilityStatus)}>
                        {formatAvailabilityStatus(item.availabilityStatus)}
                      </Badge>
                      {item.size ? <Badge variant="outline">Size {item.size}</Badge> : null}
                      {item.material ? <Badge variant="outline">{item.material}</Badge> : null}
                      {item.image ? (
                        <Badge variant="outline">
                          <ImageIcon data-icon="inline-start" />
                          Photo available
                        </Badge>
                      ) : null}
                    </div>
                  </CardHeader>

                  <CardContent className="flex flex-1 flex-col gap-3">
                    {item.colorPattern ? (
                      <p className="text-sm text-muted-foreground">
                        Color / pattern: {item.colorPattern}
                      </p>
                    ) : null}

                    {item.issues ? (
                      <Alert>
                        <TriangleAlert />
                        <AlertTitle>Known issues</AlertTitle>
                        <AlertDescription>{item.issues}</AlertDescription>
                      </Alert>
                    ) : null}
                  </CardContent>

                  <CardFooter>
                    <LinkButton
                      href={`/carriers/${item.instanceId}`}
                      variant="outline"
                      size="lg"
                      className="w-full"
                    >
                      View details
                    </LinkButton>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
